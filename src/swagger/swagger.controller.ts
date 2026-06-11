/// <reference types="multer" />
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { AuthConfig } from '../dynamic-mcp/types';
import { SwaggerService } from './swagger.service';

@Controller('swagger')
@UseGuards(JwtAuthGuard)
export class SwaggerController {
  constructor(private readonly swaggerService: SwaggerService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('baseUrl') baseUrl?: string,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');

    const lower = file.originalname.toLowerCase();
    if (!lower.endsWith('.yaml') && !lower.endsWith('.yml') && !lower.endsWith('.json')) {
      throw new BadRequestException('Formato inválido. Envie um arquivo .yaml, .yml ou .json.');
    }

    const project = await this.swaggerService.create(
      file.buffer.toString('utf-8'),
      file.originalname,
      baseUrl,
    );

    // Retorna resumo sem o rawSpec e parameterMap completo
    return {
      _id: project._id,
      name: project.name,
      baseUrl: project.baseUrl,
      description: project.description,
      version: project.version,
      status: project.status,
      toolCount: project.tools.length,
      tools: project.tools.map((t) => ({ name: t.name, description: t.description })),
    };
  }

  @Get('projects')
  findAll() {
    return this.swaggerService.findAll();
  }

  @Get('projects/:id')
  findOne(@Param('id') id: string) {
    return this.swaggerService.findOne(id);
  }

  @Patch('projects/:id/auth')
  updateAuth(@Param('id') id: string, @Body() auth: AuthConfig) {
    return this.swaggerService.updateAuth(id, auth);
  }

  @Patch('projects/:id/base-url')
  updateBaseUrl(
    @Param('id') id: string,
    @Body('baseUrl') baseUrl: string,
  ) {
    if (!baseUrl?.trim()) throw new BadRequestException('baseUrl não pode ser vazia.');
    return this.swaggerService.updateBaseUrl(id, baseUrl.trim());
  }

  @Delete('projects/:id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.swaggerService.remove(id);
  }
}
