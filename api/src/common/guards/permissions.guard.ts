import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { ROLE_REPO } from '../../database/database.tokens';
import type { IRoleRepository } from '../../roles/role.repository';
import { BUILTIN_ROLE_PERMISSIONS } from '../../roles/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as { userId: string; username: string; role: string } | undefined;
    if (!user) return false;

    if (user.role === 'admin') return true;

    const builtin = BUILTIN_ROLE_PERMISSIONS[user.role];
    if (builtin) {
      if (!builtin[permission]) throw new ForbiddenException(`Permission denied: ${permission}`);
      return true;
    }

    // Dynamic role — look up from DB
    const role = await this.roleRepo.findByName(user.role);
    if (!role) throw new ForbiddenException(`Unknown role: ${user.role}`);
    if (!role.permissions[permission]) throw new ForbiddenException(`Permission denied: ${permission}`);
    return true;
  }
}
