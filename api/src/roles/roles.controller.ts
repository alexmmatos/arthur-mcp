import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesService } from './roles.service';
import { RolePermissions } from './role.repository';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: { name: string; description?: string; permissions?: Partial<RolePermissions> }) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: { name?: string; description?: string; permissions?: Partial<RolePermissions> },
  ) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}
