import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  SwaggerProject,
  SwaggerProjectDocument,
} from '../swagger/swagger-project.schema';
import type { GeneratedTool } from './types';
import { buildRequest } from './request-builder';
import { executeRequest } from './http-client';
import { mapResponse, McpToolResult } from './response-mapper';
import { applyAuth } from './auth-provider';

@Injectable()
export class DynamicMcpService {
  private readonly logger = new Logger(DynamicMcpService.name);

  constructor(
    @InjectModel(SwaggerProject.name)
    private readonly projectModel: Model<SwaggerProjectDocument>,
  ) {}

  async createMcpServer(projectId: string): Promise<Server> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException(`Projeto ${projectId} não encontrado.`);

    const tools: GeneratedTool[] = project.tools ?? [];
    const toolMap = new Map(tools.map((t) => [t.name, t]));
    const auth = project.auth ?? { type: 'none' };

    this.logger.log(`MCP server para "${project.name}": ${tools.length} tools`);

    const server = new Server(
      { name: `mcp-convert:${project.name}`, version: project.version ?? '1.0.0' },
      { capabilities: { tools: {} } },
    );

    // ListTools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: {
          type: 'object' as const,
          properties: t.inputSchema.properties ?? {},
          ...(t.inputSchema.required ? { required: t.inputSchema.required } : {}),
        },
      })),
    }));

    // CallTool
    server.setRequestHandler(CallToolRequestSchema, async (req): Promise<any> => {
      const args = (req.params.arguments ?? {}) as Record<string, unknown>;
      const toolName = req.params.name;
      const tool = toolMap.get(toolName);

      this.logger.log(`CallTool → "${toolName}" | args: ${JSON.stringify(args)}`);

      if (!tool) {
        this.logger.warn(`Tool não encontrada: "${toolName}" | disponíveis: [${[...toolMap.keys()].join(', ')}]`);
        return {
          content: [{ type: 'text' as const, text: `Tool desconhecida: ${toolName}` }],
          isError: true,
        };
      }

      if (!tool.endpointRef) {
        this.logger.error(`Tool "${toolName}" não possui endpointRef — dados podem estar desatualizados. Re-faça o upload.`);
        return {
          content: [{ type: 'text' as const, text: `Configuração interna inválida para "${toolName}". Re-faça o upload do spec.` }],
          isError: true,
        };
      }

      try {
        let httpReq = buildRequest(args, tool.endpointRef);
        httpReq = applyAuth(httpReq, auth);

        this.logger.log(`→ HTTP ${httpReq.method} ${httpReq.url}`);

        const httpRes = await executeRequest(httpReq);

        this.logger.log(`← HTTP ${httpRes.status} ${httpRes.statusText}`);

        return mapResponse(httpRes);
      } catch (err: any) {
        this.logger.error(`Erro ao executar "${toolName}": ${err?.message}`);
        return {
          content: [{ type: 'text' as const, text: `Erro: ${err?.message ?? 'Erro desconhecido'}` }],
          isError: true,
        };
      }
    });

    return server;
  }

  /**
   * Executa uma tool diretamente — sem protocolo MCP.
   * Usado pelo endpoint REST de teste no frontend.
   */
  async executeTool(
    projectId: string,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<McpToolResult> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException(`Projeto ${projectId} não encontrado.`);

    const tools: GeneratedTool[] = project.tools ?? [];
    const tool = tools.find((t) => t.name === toolName);
    if (!tool) throw new NotFoundException(`Ferramenta "${toolName}" não encontrada.`);

    const auth = project.auth ?? { type: 'none' };

    try {
      let httpReq = buildRequest(args, tool.endpointRef);
      httpReq = applyAuth(httpReq, auth);
      const httpRes = await executeRequest(httpReq);
      return mapResponse(httpRes);
    } catch (err: any) {
      this.logger.error(`Erro ao executar ${toolName}: ${err?.message}`);
      return {
        content: [{ type: 'text', text: `Erro: ${err?.message ?? 'Erro desconhecido'}` }],
        isError: true,
      };
    }
  }
}
