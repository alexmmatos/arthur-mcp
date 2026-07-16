import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CreateMcpAppDto } from './dto/create-mcp-app.dto';
import { UpdateMcpAppDto } from './dto/update-mcp-app.dto';
import { McpAppsService } from './mcp-apps.service';

@Controller('mcp-apps')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class McpAppsController {
  constructor(private readonly service: McpAppsService) {}

  @Get()
  @RequirePermission('apps_view')
  findAll() { return this.service.findAll(); }

  @Get('sources')
  @RequirePermission('apps_create')
  listSources() { return this.service.listSources(); }

  @Get(':id')
  @RequirePermission('apps_view')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @HttpCode(201)
  @RequirePermission('apps_create')
  create(@Body() dto: CreateMcpAppDto) { return this.service.create(dto); }

  @Patch(':id')
  @RequirePermission('apps_edit')
  update(@Param('id') id: string, @Body() dto: UpdateMcpAppDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('apps_delete')
  delete(@Param('id') id: string) { return this.service.delete(id); }
}
