import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonLogger } from './logging/json-logger';

async function bootstrap() {
  const logger = new JsonLogger();

  const app = await NestFactory.create(AppModule, { logger });

  app.enableShutdownHooks();

  const port = parseInt(process.env.PORT, 10) || 3000;
  await app.listen(port);

  logger.log({
    message: 'mcp_server_started',
    port,
    endpoint: `http://localhost:${port}/mcp`,
    docs: `http://localhost:${port}/mcp-docs`,
  }, 'Bootstrap');
}

bootstrap();
