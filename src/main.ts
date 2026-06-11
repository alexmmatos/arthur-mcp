import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonLogger } from './logging/json-logger';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const logger = new JsonLogger();

  const app = await NestFactory.create(AppModule, { logger });

  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  app.enableShutdownHooks();

  // Servir arquivos estáticos do frontend
  const publicPath = join(__dirname, '..', 'public');
  app.use(express.static(publicPath));

  const port = parseInt(process.env.PORT, 10) || 3000;
  await app.listen(port);

  logger.log({
    message: 'mcp_server_started',
    port,
    endpoint: `http://localhost:${port}/mcp`,
    docs: `http://localhost:${port}/mcp-docs`,
    dashboard: `http://localhost:${port}`,
  }, 'Bootstrap');
}

bootstrap();
