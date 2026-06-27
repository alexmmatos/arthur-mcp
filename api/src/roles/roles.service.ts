import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ROLE_REPO } from '../database/database.tokens';
import { IRoleRepository, RolePermissions, RoleRecord } from './role.repository';
import { ALL_PERMISSIONS_OFF } from './permissions';

@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository,
  ) {}

  findAll(): Promise<RoleRecord[]> {
    return this.roleRepo.findAll();
  }

  async findById(id: string): Promise<RoleRecord> {
    const r = await this.roleRepo.findById(id);
    if (!r) throw new NotFoundException('Role not found.');
    return r;
  }

  async create(dto: { name: string; description?: string; permissions?: Partial<RolePermissions> }): Promise<RoleRecord> {
    if (!dto.name?.trim()) throw new BadRequestException('name is required.');
    const existing = await this.roleRepo.findByName(dto.name.trim());
    if (existing) throw new BadRequestException(`A role named "${dto.name.trim()}" already exists.`);
    return this.roleRepo.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || undefined,
      permissions: { ...ALL_PERMISSIONS_OFF, ...dto.permissions },
    });
  }

  async update(id: string, dto: { name?: string; description?: string; permissions?: Partial<RolePermissions> }): Promise<RoleRecord> {
    const r = await this.roleRepo.findById(id);
    if (!r) throw new NotFoundException('Role not found.');
    if (dto.name !== undefined && dto.name.trim() !== r.name) {
      const existing = await this.roleRepo.findByName(dto.name.trim());
      if (existing) throw new BadRequestException(`A role named "${dto.name.trim()}" already exists.`);
    }
    const updated = await this.roleRepo.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() || undefined } : {}),
      ...(dto.permissions !== undefined ? { permissions: { ...r.permissions, ...dto.permissions } } : {}),
    });
    if (!updated) throw new NotFoundException('Role not found.');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const ok = await this.roleRepo.delete(id);
    if (!ok) throw new NotFoundException('Role not found.');
  }
}
