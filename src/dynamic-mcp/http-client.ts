import type { PreparedRequest } from './request-builder';

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
}

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 3;

export async function executeRequest(
  request: PreparedRequest,
  timeout = DEFAULT_TIMEOUT,
  maxRetries = DEFAULT_RETRIES,
): Promise<HttpResponse> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
        signal: AbortSignal.timeout(timeout),
      });

      const contentType = res.headers.get('content-type') ?? '';
      const body = await res.text();
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => { headers[k] = v; });

      // Retry on 429 / 5xx
      if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
        const retryAfter = res.headers.get('retry-after');
        const delay = retryAfter
          ? Number.parseInt(retryAfter, 10) * 1000
          : Math.min(1000 * 2 ** attempt, 10_000);
        await sleep(delay);
        continue;
      }

      return { status: res.status, statusText: res.statusText, headers, body, contentType };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) { await sleep(Math.min(1000 * 2 ** attempt, 10_000)); continue; }
    }
  }

  throw new Error(`Request failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
