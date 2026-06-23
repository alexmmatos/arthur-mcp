import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RolePermissions } from './role.repository';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Object, required: true })
  permissions: RolePermissions;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
