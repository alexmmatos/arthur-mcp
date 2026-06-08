import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { McpRegistryDiscoveryService } from '@rekog/mcp-nest';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { normalizeObjectSchema } = require('@modelcontextprotocol/sdk/server/zod-compat.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { toJsonSchemaCompat } = require('@modelcontextprotocol/sdk/server/zod-json-schema-compat.js');

export interface ParamDoc {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
}

export interface ToolDoc {
  name: string;
  description: string;
  params: ParamDoc[];
  hasParams: boolean;
  curlExample: string;
}

export interface ResourceDoc {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface TemplateDoc {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface DocsData {
  serverName: string;
  version: string;
  endpoint: string;
  toolCount: number;
  resourceCount: number;
  templateCount: number;
  tools: ToolDoc[];
  resources: ResourceDoc[];
  resourceTemplates: TemplateDoc[];
}

@Injectable()
export class McpDocsService {
  private registryCache: McpRegistryDiscoveryService;

  constructor(private readonly moduleRef: ModuleRef) {}

  private get registry(): McpRegistryDiscoveryService {
    if (!this.registryCache) {
      this.registryCache = this.moduleRef.get(McpRegistryDiscoveryService, { strict: false });
    }
    return this.registryCache;
  }

  private get moduleId(): string {
    return this.registry.getMcpModuleIds()[0];
  }

  build(): DocsData {
    const port = parseInt(process.env.PORT, 10) || 3000;
    const endpoint = `http://localhost:${port}/mcp`;

    const rawTools = this.registry.getTools(this.moduleId);
    const rawResources = this.registry.getResources(this.moduleId);
    const rawTemplates = this.registry.getResourceTemplates(this.moduleId);

    const tools: ToolDoc[] = rawTools.map((t) => {
      const params = this.extractParams(t.metadata.parameters);
      return {
        name: t.metadata.name,
        description: t.metadata.description,
        params,
        hasParams: params.length > 0,
        curlExample: this.buildCurl(endpoint, t.metadata.name, params),
      };
    });

    const resources: ResourceDoc[] = rawResources.map((r) => ({
      uri: r.metadata.uri,
      name: r.metadata.name ?? r.metadata.uri,
      description: r.metadata.description ?? '',
      mimeType: r.metadata.mimeType ?? 'application/json',
    }));

    const resourceTemplates: TemplateDoc[] = rawTemplates.map((r) => ({
      uriTemplate: r.metadata.uriTemplate,
      name: r.metadata.name ?? r.metadata.uriTemplate,
      description: r.metadata.description ?? '',
      mimeType: r.metadata.mimeType ?? 'application/json',
    }));

    return {
      serverName: 'rest-api-mcp-wrapper',
      version: '1.0.0',
      endpoint,
      toolCount: tools.length,
      resourceCount: resources.length,
      templateCount: resourceTemplates.length,
      tools,
      resources,
      resourceTemplates,
    };
  }

  private extractParams(zodSchema: any): ParamDoc[] {
    if (!zodSchema) return [];

    try {
      const normalized = normalizeObjectSchema(zodSchema);
      if (!normalized) return [];

      const jsonSchema = toJsonSchemaCompat(normalized) as any;
      const props: Record<string, any> = jsonSchema.properties ?? {};
      const required: string[] = jsonSchema.required ?? [];

      return Object.entries(props).map(([name, schema]: [string, any]) => ({
        name,
        type: this.resolveType(schema),
        required: required.includes(name),
        description: schema.description ?? '',
        example: this.exampleValue(schema),
      }));
    } catch {
      return [];
    }
  }

  private resolveType(schema: any): string {
    if (schema.type === 'integer') return 'integer';
    if (schema.type) return schema.type as string;
    if (schema.anyOf) return schema.anyOf.map((s: any) => s.type ?? '?').join(' | ');
    return 'any';
  }

  private exampleValue(schema: any): string {
    const type = schema.type ?? '';
    if (type === 'string') return '"1"';
    if (type === 'integer' || type === 'number') return '1';
    if (type === 'boolean') return 'true';
    return '"value"';
  }

  private buildCurl(endpoint: string, toolName: string, params: ParamDoc[]): string {
    const args: Record<string, any> = {};
    for (const p of params) {
      if (p.type === 'string') args[p.name] = '1';
      else if (p.type === 'integer' || p.type === 'number') args[p.name] = 1;
      else if (p.type === 'boolean') args[p.name] = true;
      else args[p.name] = 'value';
    }

    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    });

    return `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $MCP_API_KEY" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '${body}'`;
  }
}
