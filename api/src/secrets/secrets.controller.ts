import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { SecretsService } from './secrets.service';

@Controller('secrets')
@UseGuards(JwtAuthGuard)
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Get()
  findAll() {
    return this.secretsService.findAll();
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: { name: string; value: string; description?: string }) {
    return this.secretsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: { name?: string; value?: string; description?: string },
  ) {
    return this.secretsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.secretsService.delete(id);
  }
}
