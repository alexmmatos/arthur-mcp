import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SecretDocument = Secret & Document;

@Schema({ timestamps: true })
export class Secret {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  value: string;

  @Prop()
  description?: string;
}

export const SecretSchema = SchemaFactory.createForClass(Secret);
