import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'dev']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MCP_API_KEY: z.string().min(1, 'MCP_API_KEY is required and cannot be empty'),
  EXTERNAL_API_BASE_URL: z.string().url().default('https://jsonplaceholder.typicode.com'),
  MONGODB_URI: z.string().url().default('mongodb://localhost:27017/mcp_db'),
  DASHBOARD_USER: z.string().min(1).default('admin'),
  DASHBOARD_PASSWORD: z.string().min(1).default('admin123'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('change-me-in-production-secret'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  return result.data;
}
