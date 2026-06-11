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
  get mongoUri(): string {
    return process.env.MONGODB_URI ?? 'mongodb://localhost:27017/mcp_db';
  },
  get dashboardUser(): string {
    return process.env.DASHBOARD_USER ?? 'admin';
  },
  get dashboardPassword(): string {
    return process.env.DASHBOARD_PASSWORD ?? 'admin123';
  },
  get jwtSecret(): string {
    return process.env.JWT_SECRET ?? 'change-me-in-production-secret';
  },
};
