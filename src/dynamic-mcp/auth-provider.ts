import type { AuthConfig } from './types';
import type { PreparedRequest } from './request-builder';

export function applyAuth(request: PreparedRequest, auth: AuthConfig): PreparedRequest {
  const headers = { ...request.headers };

  switch (auth.type) {
    case 'bearer':
      if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;
      break;
    case 'api-key':
      if (auth.in === 'header') {
        headers[auth.name] = auth.value;
      } else {
        // query — adiciona na URL
        const url = new URL(request.url);
        url.searchParams.set(auth.name, auth.value);
        return { ...request, headers, url: url.toString() };
      }
      break;
    case 'basic': {
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      headers['Authorization'] = `Basic ${encoded}`;
      break;
    }
    case 'none':
    default:
      break;
  }

  return { ...request, headers };
}
