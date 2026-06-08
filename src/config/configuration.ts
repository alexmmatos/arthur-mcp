export const config = {
  get port(): number {
    return parseInt(process.env.PORT, 10) || 3000;
  },
  get mcpApiKey(): string {
    return process.env.MCP_API_KEY ?? '';
  },
  get externalApiBaseUrl(): string {
    return process.env.EXTERNAL_API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';
  },
};
