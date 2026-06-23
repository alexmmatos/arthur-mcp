import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ROLE_REPO } from '../database/database.tokens';
import { IRoleRepository } from '../roles/role.repository';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogs: AuditLogsService,
    @Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository,
  ) {}

  /** Authenticated user profile — includes role permissions so the frontend can enforce them */
  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    const { password: _, ...safe } = user as any;

    if (safe.role !== 'admin') {
      const role = await this.roleRepo.findByName(safe.role);
      if (role) {
        safe.permissions = role.permissions;
      }
    }

    return safe;
  }

  /** Update own profile */
  @Patch('me')
  updateMe(
    @Request() req: any,
    @Body() dto: { username?: string; email?: string; currentPassword?: string; newPassword?: string },
  ) {
    return this.usersService.updateSelf(req.user.userId, dto);
  }

  /** List all users — admin only */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /** Create new user — admin only */
  @Post()
  @HttpCode(201)
  async create(
    @Request() req: any,
    @Body() dto: { username: string; email: string; password: string; role?: string },
  ) {
    const user = await this.usersService.create(dto.username, dto.password, dto.email, dto.role ?? 'user');
    this.auditLogs.log({ userId: req.user.userId, username: req.user.username, action: 'create', entity: 'user', entityId: String(user._id), entityName: dto.username, ip: req.ip });
    return user;
  }

  /** Edit any user — admin only */
  @Patch(':id')
  async updateUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { username?: string; email?: string; password?: string; role?: string },
  ) {
    const user = await this.usersService.updateByAdmin(id, dto);
    this.auditLogs.log({ userId: req.user.userId, username: req.user.username, action: 'update', entity: 'user', entityId: id, entityName: dto.username, ip: req.ip });
    return user;
  }

  /** Delete user — admin only (cannot delete own account) */
  @Delete(':id')
  @HttpCode(204)
  async remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.userId === id) throw new ForbiddenException('Cannot delete your own account.');
    await this.usersService.remove(id);
    this.auditLogs.log({ userId: req.user.userId, username: req.user.username, action: 'delete', entity: 'user', entityId: id, ip: req.ip });
  }
}
