import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SECRET_REPO } from '../database/database.tokens';
import { ISecretRepository, SecretRecord } from './secret.repository';

@Injectable()
export class SecretsService {
  constructor(
    @Inject(SECRET_REPO) private readonly secretRepo: ISecretRepository,
  ) {}

  findAll(): Promise<SecretRecord[]> {
    return this.secretRepo.findAll();
  }

  async findById(id: string): Promise<SecretRecord> {
    const s = await this.secretRepo.findById(id);
    if (!s) throw new NotFoundException('Secret not found.');
    return s;
  }

  async create(dto: { name: string; value: string; description?: string }): Promise<SecretRecord> {
    if (!dto.name?.trim()) throw new BadRequestException('name is required.');
    if (!dto.value?.trim()) throw new BadRequestException('value is required.');
    const existing = await this.secretRepo.findByName(dto.name.trim());
    if (existing) throw new BadRequestException(`A secret named "${dto.name.trim()}" already exists.`);
    return this.secretRepo.create({ name: dto.name.trim(), value: dto.value, description: dto.description?.trim() });
  }

  async update(id: string, dto: { name?: string; value?: string; description?: string }): Promise<SecretRecord> {
    const s = await this.secretRepo.findById(id);
    if (!s) throw new NotFoundException('Secret not found.');
    if (dto.name !== undefined && dto.name.trim() !== s.name) {
      const existing = await this.secretRepo.findByName(dto.name.trim());
      if (existing) throw new BadRequestException(`A secret named "${dto.name.trim()}" already exists.`);
    }
    const updated = await this.secretRepo.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.value !== undefined ? { value: dto.value } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() || undefined } : {}),
    });
    if (!updated) throw new NotFoundException('Secret not found.');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const ok = await this.secretRepo.delete(id);
    if (!ok) throw new NotFoundException('Secret not found.');
  }
}
