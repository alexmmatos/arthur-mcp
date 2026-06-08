import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/configuration';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey || apiKey !== config.mcpApiKey) {
      res.status(401).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32000,
          message: 'Unauthorized: invalid or missing x-api-key header',
          data: {
            reason: 'authentication_failed',
          },
        },
      });
      return;
    }

    next();
  }
}
