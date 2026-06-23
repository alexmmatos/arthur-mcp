import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../role.schema';
import { IRoleRepository, RoleRecord } from '../role.repository';

@Injectable()
export class MongoRoleRepository implements IRoleRepository {
  constructor(
    @InjectModel(Role.name) private readonly model: Model<RoleDocument>,
  ) {}

  private toRecord(doc: RoleDocument | Record<string, any>): RoleRecord {
    const obj = typeof (doc as any).toObject === 'function' ? (doc as any).toObject() : doc;
    return {
      id: String(obj._id),
      name: obj.name,
      description: obj.description,
      permissions: obj.permissions,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async findAll(): Promise<RoleRecord[]> {
    const docs = await this.model.find().sort({ createdAt: 1 }).lean().exec();
    return docs.map((d) => this.toRecord(d as any));
  }

  async findById(id: string): Promise<RoleRecord | null> {
    try {
      const doc = await this.model.findById(id).exec();
      return doc ? this.toRecord(doc) : null;
    } catch { return null; }
  }

  async findByName(name: string): Promise<RoleRecord | null> {
    const doc = await this.model.findOne({ name }).exec();
    return doc ? this.toRecord(doc) : null;
  }

  async create(data: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleRecord> {
    const doc = await this.model.create(data);
    return this.toRecord(doc);
  }

  async update(id: string, data: Partial<Omit<RoleRecord, 'id'>>): Promise<RoleRecord | null> {
    try {
      const doc = await this.model.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
      return doc ? this.toRecord(doc) : null;
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch { return false; }
  }
}
