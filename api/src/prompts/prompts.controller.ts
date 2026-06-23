import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PromptsService } from './prompts.service';

@Controller('prompts')
@UseGuards(JwtAuthGuard)
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Get()
  findAll() {
    return this.promptsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.promptsService.findById(id);
  }

  @Post()
  create(@Body() dto: { name: string; description?: string; content: string; tags?: string[] }) {
    return this.promptsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<{ name: string; description?: string; content: string; tags: string[] }>,
  ) {
    return this.promptsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.promptsService.delete(id);
  }
}
