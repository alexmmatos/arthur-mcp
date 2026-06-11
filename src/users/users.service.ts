import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async onApplicationBootstrap(): Promise<void> {
    const exists = await this.userModel.findOne({ username: 'admin' });
    if (!exists) {
      await this.create('admin', 'admin', 'admin@mcp-transform.io', 'admin');
    }
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username: username.toLowerCase().trim() });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() });
  }

  async create(
    username: string,
    password: string,
    email: string,
    role = 'user',
  ): Promise<UserDocument> {
    const hash = await bcrypt.hash(password, 10);
    return this.userModel.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hash,
      role,
    });
  }

  async validatePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
