import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  _id!: string;

  @Prop({ required: true, trim: true })
  @ApiProperty({ example: 'Rahul Sharma' })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  @ApiProperty({ example: 'rahul@example.com' })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: String, default: null, trim: true })
  @ApiProperty({ example: '+91 9876543210', nullable: true })
  phone!: string | null;

  @Prop({ type: String, default: null })
  @ApiProperty({ example: null, nullable: true })
  avatar!: string | null;

  @Prop({ type: Boolean, default: false })
  isTemporaryPassword!: boolean;

  @Prop({ type: String, default: null })
  refreshToken!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
