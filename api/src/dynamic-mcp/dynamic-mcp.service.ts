import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import Handlebars from 'handlebars';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { AuthConfig, GeneratedTool, JsonSchema, McpResource } from './types';
import { buildRequest } from './request-builder';
import { executeRequest } from './http-client';
import { mapResponse, McpToolResult } from './response-mapper';
import { applyAuth } from './auth-provider';
import { ExecutionLogsService } from '../execution-logs/execution-logs.service';
import { PROJECT_REPO, PROMPT_REPO } from '../database/database.tokens';
import { ISwaggerProjectRepository } from '../swagger/swagger-project.repository';
import type { IPromptRepository, PromptRecord } from '../prompts/prompt.repository';

interface CachedProject {
  tools: GeneratedTool[];
  auth: AuthConfig;
  name: string;
  version: string;
  resources: McpResource[];
  prompts: PromptRecord[];
  expiresAt: number;
}

function validateToolArgs(args: Record<string, unknown>, schema: JsonSchema): string[] {
  const errors: string[] = [];
  const required = schema.required ?? [];
  const properties = schema.properties ?? {};

  for (const field of required) {
    if (args[field] === undefined || args[field] === null) {
      errors.push(`required field missing: "${field}"`);
    }
  }

  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === null) continue;
    const prop = properties[key];
    if (!prop?.type) continue;
    const t = prop.type as string;
    if (t === 'string' && typeof value !== 'string') {
      errors.push(`"${key}" must be a string`);
    } else if (t === 'boolean' && typeof value !== 'boolean') {
      errors.push(`"${key}" must be a boolean`);
    } else if (t === 'array' && !Array.isArray(value)) {
      errors.push(`"${key}" must be an array`);
    } else if (t === 'integer' && !Number.isInteger(value)) {
      errors.push(`"${key}" must be an integer`);
    } else if (t === 'number' && typeof value !== 'number') {
      errors.push(`"${key}" must be a number`);
    }
  }

  return errors;
}

function compileAndRender(template: string, data: unknown): string {
  return Handlebars.compile(template)(data);
}

@Injectable()
export class DynamicMcpService {
  private readonly logger = new Logger(DynamicMcpService.name);
  private readonly projectCache = new Map<string, CachedProject>();
  private readonly CACHE_TTL_MS = 60_000;

  constructor(
    @Inject(PROJECT_REPO) private readonly projectRepo: ISwaggerProjectRepository,
    @Inject(PROMPT_REPO) private readonly promptRepo: IPromptRepository,
    private readonly executionLogs: ExecutionLogsService,
  ) {}

  invalidate(projectId: string): void {
    this.projectCache.delete(projectId);
  }

  private async getProjectData(projectId: string): Promise<CachedProject> {
    const cached = this.projectCache.get(projectId);
    if (cached && cached.expiresAt > Date.now()) return cached;

    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException(`Project ${projectId} not found.`);

    const promptRefs = (project.prompts ?? []) as Array<{ promptId?: string }>;
    const resolvedPrompts: PromptRecord[] = [];
    for (const ref of promptRefs) {
      if (!ref.promptId) continue;
      const p = await this.promptRepo.findById(ref.promptId);
      if (p) resolvedPrompts.push(p);
    }

    const entry: CachedProject = {
      tools: project.tools ?? [],
      auth: project.auth ?? { type: 'none' },
      name: project.name,
      version: project.version ?? '1.0.0',
      resources: project.resources ?? [],
      prompts: resolvedPrompts,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    };
    this.projectCache.set(projectId, entry);
    return entry;
  }

  async createMcpServer(projectId: string): Promise<Server> {
    const { tools: allTools, auth, name, version, resources, prompts } = await this.getProjectData(projectId);

    const tools: GeneratedTool[] = allTools.filter((t) => t.enabled !== false);
    const toolMap = new Map(tools.map((t) => [t.name, t]));

    this.logger.log(`MCP server para "${name}": ${tools.length} tools (${allTools.length} total, ${allTools.filter(t => t.enabled === false).length} disabled)`);

    const server = new Server(
      { name: `arthur-mcp-adapter:${name}`, version },
      { capabilities: { tools: {}, resources: {}, prompts: {} } },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: tools.map((t) => {
        const method = (t.endpointRef?.method ?? 'GET').toUpperCase();
        const readOnly = method === 'GET' || method === 'HEAD';
        const destructive = method === 'DELETE';
        return {
          name: t.name,
          description: t.description,
          inputSchema: {
            type: 'object' as const,
            properties: t.inputSchema.properties ?? {},
            ...(t.inputSchema.required ? { required: t.inputSchema.required } : {}),
          },
          ...(t.outputSchema ? { outputSchema: t.outputSchema } : {}),
          annotations: {
            readOnlyHint: readOnly,
            destructiveHint: destructive,
            openWorldHint: true,
          },
        };
      }),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (req): Promise<any> => {
      const args = (req.params.arguments ?? {}) as Record<string, unknown>;
      const toolName = req.params.name;
      const tool = toolMap.get(toolName);
      const t0 = Date.now();

      this.logger.log(`CallTool → "${toolName}" | args: ${JSON.stringify(args)}`);

      if (!tool) {
        this.logger.warn(`Tool not found: "${toolName}" | available: [${[...toolMap.keys()].join(', ')}]`);
        this.executionLogs.log({ projectId, projectName: name, toolName, source: 'mcp', isError: true, statusCode: 404, errorMessage: 'Tool not found', responseTimeMs: Date.now() - t0 });
        return { content: [{ type: 'text' as const, text: `Tool desconhecida: ${toolName}` }], isError: true };
      }

      if (!tool.endpointRef) {
        this.logger.error(`Tool "${toolName}" has no endpointRef — data may be stale. Re-upload the spec.`);
        this.executionLogs.log({ projectId, projectName: name, toolName, source: 'mcp', isError: true, statusCode: 500, errorMessage: 'endpointRef ausente', responseTimeMs: Date.now() - t0 });
        return { content: [{ type: 'text' as const, text: `Invalid internal configuration for "${toolName}". Re-upload the spec.` }], isError: true };
      }

      const validationErrors = validateToolArgs(args, tool.inputSchema);
      if (validationErrors.length > 0) {
        const msg = `Invalid arguments: ${validationErrors.join('; ')}`;
        this.logger.warn(`Tool "${toolName}" — ${msg}`);
        this.executionLogs.log({ projectId, projectName: name, toolName, source: 'mcp', isError: true, statusCode: 400, errorMessage: msg, responseTimeMs: Date.now() - t0 });
        return { content: [{ type: 'text' as const, text: msg }], isError: true };
      }

      try {
        let httpReq = buildRequest(args, tool.endpointRef);
        httpReq = await applyAuth(httpReq, auth);
        this.logger.log(`→ HTTP ${httpReq.method} ${httpReq.url}`);
        const httpRes = await executeRequest(httpReq);
        this.logger.log(`← HTTP ${httpRes.status} ${httpRes.statusText}`);
        const result = mapResponse(httpRes);
        this.executionLogs.log({ projectId, projectName: name, toolName, source: 'mcp', statusCode: httpRes.status, responseTimeMs: Date.now() - t0, isError: result.isError ?? false });

        // If the tool declares an outputSchema, also populate structuredContent
        if (tool.outputSchema && !result.isError) {
          const rawText = (result as any).content?.[0]?.text;
          if (rawText) {
            try {
              const parsed = JSON.parse(rawText);
              return { ...result, structuredContent: parsed };
            } catch { /* non-JSON response — structuredContent omitted */ }
          }
        }

        return result;
      } catch (err: any) {
        this.logger.error(`Erro ao executar "${toolName}": ${err?.message}`);
        this.executionLogs.log({ projectId, projectName: name, toolName, source: 'mcp', isError: true, statusCode: 500, errorMessage: err?.message, responseTimeMs: Date.now() - t0 });
        return { content: [{ type: 'text' as const, text: `Erro: ${err?.message ?? 'Erro desconhecido'}` }], isError: true };
      }
    });

    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: resources.map((r) => ({
        uri: r.uri,
        name: r.name,
        ...(r.description ? { description: r.description } : {}),
        ...(r.mimeType ? { mimeType: r.mimeType } : {}),
      })),
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
      const uri = req.params.uri;
      const resource = resources.find((r) => r.uri === uri);
      if (!resource) throw new Error(`Resource not found: ${uri}`);

      if (resource.type !== 'dynamic' || !resource.endpointRef) {
        return { contents: [{ uri, text: resource.content, ...(resource.mimeType ? { mimeType: resource.mimeType } : {}) }] };
      }

      try {
        let httpReq = buildRequest(resource.inputDefaults ?? {}, resource.endpointRef);
        httpReq = await applyAuth(httpReq, auth);
        const httpRes = await executeRequest(httpReq);
        if (httpRes.status >= 400) throw new Error(`HTTP ${httpRes.status}: ${httpRes.body.slice(0, 200)}`);
        const parsed = JSON.parse(httpRes.body);
        const rendered = compileAndRender(resource.content, parsed);
        return { contents: [{ uri, text: rendered, mimeType: resource.mimeType ?? 'text/html' }] };
      } catch (err: any) {
        const errorMsg = err?.message ?? 'unknown error';
        const msg = (resource.errorConfig?.message ?? 'Error loading resource: {{error}}').replace('{{error}}', errorMsg);
        return { contents: [{ uri, text: msg, mimeType: 'text/plain' }] };
      }
    });

    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: prompts.map((p) => {
        const argNames = [...new Set([...p.content.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
        return {
          name: p.name,
          ...(p.description ? { description: p.description } : {}),
          ...(argNames.length ? { arguments: argNames.map((name) => ({ name, required: false })) } : {}),
        };
      }),
    }));

    server.setRequestHandler(GetPromptRequestSchema, async (req) => {
      const { name, arguments: args = {} } = req.params as { name: string; arguments?: Record<string, string> };
      const prompt = prompts.find((p) => p.name === name);
      if (!prompt) throw new Error(`Prompt not found: ${name}`);

      const text = prompt.content.replace(
        /\{\{(\w+)\}\}/g,
        (_, key) => String((args as Record<string, string>)[key] ?? `{{${key}}}`),
      );

      return {
        messages: [{ role: 'user' as const, content: { type: 'text' as const, text } }],
      };
    });

    return server;
  }

  async executeTool(
    projectId: string,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<McpToolResult> {
    const { tools: allTools, auth, name } = await this.getProjectData(projectId);

    const tool = allTools.find((t) => t.name === toolName);
    if (!tool) throw new NotFoundException(`Tool "${toolName}" not found.`);

    const t0 = Date.now();

    const validationErrors = validateToolArgs(args, tool.inputSchema);
    if (validationErrors.length > 0) {
      const msg = `Invalid arguments: ${validationErrors.join('; ')}`;
      this.executionLogs.log({ projectId, projectName: name, toolName, source: 'direct', isError: true, statusCode: 400, errorMessage: msg, responseTimeMs: 0 });
      return { content: [{ type: 'text', text: msg }], isError: true };
    }

    try {
      let httpReq = buildRequest(args, tool.endpointRef);
      httpReq = await applyAuth(httpReq, auth);
      const httpRes = await executeRequest(httpReq);
      const result = mapResponse(httpRes);
      this.executionLogs.log({ projectId, projectName: name, toolName, source: 'direct', statusCode: httpRes.status, responseTimeMs: Date.now() - t0, isError: result.isError ?? false });
      return result;
    } catch (err: any) {
      this.logger.error(`Erro ao executar ${toolName}: ${err?.message}`);
      this.executionLogs.log({ projectId, projectName: name, toolName, source: 'direct', isError: true, statusCode: 500, errorMessage: err?.message, responseTimeMs: Date.now() - t0 });
      return { content: [{ type: 'text', text: `Erro: ${err?.message ?? 'Erro desconhecido'}` }], isError: true };
    }
  }
}
