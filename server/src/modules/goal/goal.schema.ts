import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type GoalDocument = Goal & Document;

export type GoalPriority = 'low' | 'medium' | 'high';

@Schema()
export class Contribution {
  @Prop({ required: true, type: String })
  _id!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, type: String })
  contributedBy!: string;

  @Prop({ type: String, default: '' })
  note!: string;

  @Prop({ default: Date.now })
  date!: Date;
}

export const ContributionSchema = SchemaFactory.createForClass(Contribution);

@Schema({ timestamps: true })
export class Goal {
  @ApiProperty()
  _id!: string;

  @Prop({ required: true, type: String })
  familyId!: string;

  @Prop({ required: true, trim: true })
  @ApiProperty({ example: 'Family Vacation' })
  title!: string;

  @Prop({ type: String, default: '', trim: true })
  description!: string;

  @Prop({ required: true, min: 1 })
  @ApiProperty({ example: 80000 })
  targetAmount!: number;

  @Prop({ type: Date, default: null })
  deadline!: Date | null;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  priority!: GoalPriority;

  @Prop({ type: String, default: '#6366f1' })
  color!: string;

  @Prop({ type: [ContributionSchema], default: [] })
  contributions!: Contribution[];

  @Prop({ type: Boolean, default: false })
  isCompleted!: boolean;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);

GoalSchema.index({ familyId: 1 });
GoalSchema.index({ familyId: 1, isCompleted: 1 });
