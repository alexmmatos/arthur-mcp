import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'dev']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MCP_API_KEY: z.string().min(1, 'MCP_API_KEY is required and cannot be empty'),
  EXTERNAL_API_BASE_URL: z.string().url().default('https://jsonplaceholder.typicode.com'),
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
