import { buildParams } from './param-builder';
import type { GeneratedTool, NormalizedEndpoint, NormalizedSpec } from './types';

export function generateTools(spec: NormalizedSpec, baseUrlOverride?: string): GeneratedTool[] {
  const baseUrl = (baseUrlOverride ?? spec.servers[0]?.url ?? 'http://localhost').replace(/\/$/, '');
  const rawNames = spec.endpoints.map((ep) => toolName(ep));
  const names = resolveCollisions(rawNames);

  return spec.endpoints.map((endpoint, i) => {
    const { inputSchema, parameterMap } = buildParams(endpoint);
    return {
      name: names[i],
      description: buildDescription(endpoint),
      inputSchema,
      endpointRef: {
        method: endpoint.method.toUpperCase(),
        path: endpoint.path,
        baseUrl,
        contentType: endpoint.requestBody?.contentType ?? 'application/json',
        parameterMap,
      },
    };
  });
}

function toolName(ep: NormalizedEndpoint): string {
  const raw = ep.operationId ?? `${ep.method}_${ep.path}`;
  return raw
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .slice(0, 64) || 'tool';
}

function resolveCollisions(names: string[]): string[] {
  const count = new Map<string, number>();
  const result: string[] = [];
  const seen = new Set<string>();

  for (const name of names) count.set(name, (count.get(name) ?? 0) + 1);

  const suffix = new Map<string, number>();
  for (const name of names) {
    if (count.get(name)! > 1) {
      const s = (suffix.get(name) ?? 1);
      const unique = `${name}_${s}`;
      suffix.set(name, s + 1);
      result.push(unique);
      seen.add(unique);
    } else {
      result.push(name);
      seen.add(name);
    }
  }
  return result;
}

function buildDescription(ep: NormalizedEndpoint): string {
  const parts: string[] = [];
  if (ep.summary) {
    parts.push(ep.summary);
  } else if (ep.description) {
    const first = ep.description.split(/\.\s/)[0];
    parts.push(first.length < 200 ? first : first.slice(0, 200));
  }
  parts.push(`[${ep.method.toUpperCase()} ${ep.path}]`);
  if (ep.deprecated) parts.push('(DEPRECATED)');
  return parts.join(' ');
}
