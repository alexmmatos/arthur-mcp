/**
 * Converts a Postman Collection v2.0 / v2.1 into a minimal OpenAPI 3.0 object
 * so it can be passed through the existing parseSpec → generateTools pipeline.
 */

interface PostmanUrl {
  raw?: string;
  protocol?: string;
  host?: string | string[];
  path?: string | string[];
  query?: { key: string; value?: string; description?: string }[];
}

interface PostmanRequest {
  method?: string;
  url?: string | PostmanUrl;
  header?: { key: string; value: string }[];
  body?: { mode?: string; raw?: string; formdata?: { key: string; value?: string; description?: string }[] };
  description?: string;
}

interface PostmanItem {
  name: string;
  request?: PostmanRequest;
  item?: PostmanItem[];  // folder
  description?: string;
}

interface PostmanCollection {
  info: { name: string; description?: string };
  item: PostmanItem[];
}

function extractRawUrl(url: string | PostmanUrl | undefined): string {
  if (!url) return '/';
  if (typeof url === 'string') return url;
  return url.raw ?? '/';
}

function urlToPath(rawUrl: string): { baseUrl: string; path: string } {
  try {
    const u = new URL(rawUrl);
    return { baseUrl: `${u.protocol}//${u.host}`, path: u.pathname || '/' };
  } catch {
    return { baseUrl: '', path: rawUrl };
  }
}

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 60) || 'tool';
}

function collectItems(items: PostmanItem[], result: PostmanItem[] = []): PostmanItem[] {
  for (const item of items) {
    if (item.request) result.push(item);
    if (item.item) collectItems(item.item, result);
  }
  return result;
}

export function parsePostmanCollection(content: string): Record<string, any> {
  let col: PostmanCollection;
  try {
    col = JSON.parse(content);
  } catch {
    throw new Error('Invalid JSON — could not parse Postman collection.');
  }

  if (!col.info || !Array.isArray(col.item)) {
    throw new Error('Not a valid Postman collection (missing info or item array).');
  }

  const flatItems = collectItems(col.item);
  if (flatItems.length === 0) throw new Error('No requests found in the collection.');

  // Detect dominant base URL
  const urlCounts = new Map<string, number>();
  for (const item of flatItems) {
    const raw = extractRawUrl(item.request?.url);
    const { baseUrl } = urlToPath(raw);
    if (baseUrl) urlCounts.set(baseUrl, (urlCounts.get(baseUrl) ?? 0) + 1);
  }
  const dominantBase = [...urlCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

  const paths: Record<string, any> = {};
  const nameCount = new Map<string, number>();

  for (const item of flatItems) {
    const req = item.request!;
    const raw = extractRawUrl(req.url);
    const { path } = urlToPath(raw);
    const method = (req.method ?? 'GET').toLowerCase();

    // Build unique operationId
    let baseName = sanitizeName(item.name);
    const count = nameCount.get(baseName) ?? 0;
    nameCount.set(baseName, count + 1);
    const operationId = count > 0 ? `${baseName}_${count}` : baseName;

    // Query params from URL
    const urlObj = typeof req.url === 'object' ? req.url : null;
    const queryParams = urlObj?.query ?? [];
    const parameters = queryParams
      .filter(q => q.key)
      .map(q => ({
        name: q.key,
        in: 'query',
        required: false,
        description: q.description ?? '',
        schema: { type: 'string' },
      }));

    // Path params from {param} or :param patterns
    const pathParamMatches = path.matchAll(/\{([^}]+)\}|:([a-zA-Z_][a-zA-Z0-9_]*)/g);
    for (const m of pathParamMatches) {
      const paramName = m[1] ?? m[2];
      if (!parameters.find(p => p.name === paramName)) {
        parameters.push({ name: paramName, in: 'path', required: true, description: '', schema: { type: 'string' } });
      }
    }

    const operation: Record<string, any> = {
      operationId,
      summary: item.name,
      description: typeof req.description === 'string' ? req.description : '',
      parameters,
      responses: { '200': { description: 'Success' } },
    };

    // Body for POST/PUT/PATCH
    if (['post', 'put', 'patch'].includes(method) && req.body?.raw) {
      operation.requestBody = {
        required: true,
        content: { 'application/json': { schema: { type: 'object' } } },
      };
    }

    // Normalise path — replace :param with {param}
    const normPath = path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '{$1}');

    if (!paths[normPath]) paths[normPath] = {};
    paths[normPath][method] = operation;
  }

  return {
    openapi: '3.0.0',
    info: { title: col.info.name, version: '1.0.0', description: col.info.description ?? '' },
    servers: dominantBase ? [{ url: dominantBase }] : [],
    paths,
  };
}
