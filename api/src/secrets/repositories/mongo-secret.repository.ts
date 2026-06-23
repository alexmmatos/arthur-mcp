import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Secret, SecretDocument } from '../secret.schema';
import { ISecretRepository, SecretRecord } from '../secret.repository';

@Injectable()
export class MongoSecretRepository implements ISecretRepository {
  constructor(
    @InjectModel(Secret.name) private readonly model: Model<SecretDocument>,
  ) {}

  private toRecord(doc: SecretDocument | Record<string, any>): SecretRecord {
    const obj = typeof (doc as any).toObject === 'function' ? (doc as any).toObject() : doc;
    return {
      id: String(obj._id),
      name: obj.name,
      value: obj.value,
      description: obj.description,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async findAll(): Promise<SecretRecord[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).lean().exec();
    return docs.map((d) => this.toRecord(d as any));
  }

  async findById(id: string): Promise<SecretRecord | null> {
    try {
      const doc = await this.model.findById(id).exec();
      return doc ? this.toRecord(doc) : null;
    } catch { return null; }
  }

  async findByName(name: string): Promise<SecretRecord | null> {
    const doc = await this.model.findOne({ name }).exec();
    return doc ? this.toRecord(doc) : null;
  }

  async create(data: Omit<SecretRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecretRecord> {
    const doc = await this.model.create(data);
    return this.toRecord(doc);
  }

  async update(id: string, data: Partial<Omit<SecretRecord, 'id'>>): Promise<SecretRecord | null> {
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
