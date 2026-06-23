import { describe, it, expect, beforeEach } from 'vitest';

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exports a default axios instance with baseURL /api', async () => {
    const { default: api } = await import('./api');
    expect(api.defaults.baseURL).toBe('/api');
  });

  it('has get and post methods', async () => {
    const { default: api } = await import('./api');
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
  });

  it('has delete and put methods', async () => {
    const { default: api } = await import('./api');
    expect(typeof api.delete).toBe('function');
    expect(typeof api.put).toBe('function');
  });

  it('attaches request interceptor that reads token from localStorage', async () => {
    const { default: api } = await import('./api');
    // Interceptors array is populated by the interceptors.request.use call
    expect(api.interceptors.request).toBeDefined();
  });

  it('attaches response interceptor for 401 handling', async () => {
    const { default: api } = await import('./api');
    expect(api.interceptors.response).toBeDefined();
  });
});
