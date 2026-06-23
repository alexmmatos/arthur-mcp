import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const lim = Math.min(Number(limit) || 50, 200);
    const sk = Number(skip) || 0;
    const [logs, total] = await Promise.all([
      this.service.findAll(lim, sk),
      this.service.count(),
    ]);
    return { logs, total, limit: lim, skip: sk };
  }
}
