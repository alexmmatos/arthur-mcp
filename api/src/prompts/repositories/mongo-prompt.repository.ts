import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prompt, PromptDocument } from '../prompt.schema';
import { IPromptRepository, PromptRecord } from '../prompt.repository';

@Injectable()
export class MongoPromptRepository implements IPromptRepository {
  constructor(
    @InjectModel(Prompt.name) private readonly model: Model<PromptDocument>,
  ) {}

  private toRecord(doc: PromptDocument | Record<string, any>): PromptRecord {
    const obj = typeof (doc as any).toObject === 'function' ? (doc as any).toObject() : doc;
    return {
      id: String(obj._id),
      name: obj.name,
      description: obj.description,
      content: obj.content,
      tags: obj.tags ?? [],
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async findAll(): Promise<PromptRecord[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).lean().exec();
    return docs.map((d) => this.toRecord(d as any));
  }

  async findById(id: string): Promise<PromptRecord | null> {
    try {
      const doc = await this.model.findById(id).exec();
      return doc ? this.toRecord(doc) : null;
    } catch {
      return null;
    }
  }

  async create(data: Omit<PromptRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromptRecord> {
    const doc = await this.model.create(data);
    return this.toRecord(doc);
  }

  async update(id: string, data: Partial<Omit<PromptRecord, 'id'>>): Promise<PromptRecord | null> {
    try {
      const doc = await this.model.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
      return doc ? this.toRecord(doc) : null;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch {
      return false;
    }
  }
}
