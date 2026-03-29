import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    isTemporaryPassword?: boolean;
  }): Promise<UserDocument> {
    return this.userModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      isTemporaryPassword: data.isTemporaryPassword ?? false,
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string },
  ): Promise<UserDocument | null> {
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.phone !== undefined) update.phone = data.phone;

    return this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .exec();
  }

  async updateAvatar(
    userId: string,
    avatarPath: string,
  ): Promise<UserDocument | null> {
    // Delete old avatar file if exists
    const user = await this.userModel.findById(userId).exec();
    if (user?.avatar) {
      const oldPath = join(process.cwd(), user.avatar);
      try {
        await unlink(oldPath);
      } catch {
        // file may not exist, ignore
      }
    }

    return this.userModel
      .findByIdAndUpdate(userId, { avatar: avatarPath }, { new: true })
      .exec();
  }

  async removeAvatar(userId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId).exec();
    if (user?.avatar) {
      const oldPath = join(process.cwd(), user.avatar);
      try {
        await unlink(oldPath);
      } catch {
        // ignore
      }
    }

    return this.userModel
      .findByIdAndUpdate(userId, { avatar: null }, { new: true })
      .exec();
  }

  async updatePassword(
    userId: string,
    hashedPassword: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { password: hashedPassword, isTemporaryPassword: false },
        { new: true },
      )
      .exec();
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { refreshToken })
      .exec();
  }
}
