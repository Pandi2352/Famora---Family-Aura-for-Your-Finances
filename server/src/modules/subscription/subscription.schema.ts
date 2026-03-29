import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SubscriptionDocument = Subscription & Document;
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

@Schema({ timestamps: true })
export class Subscription {
  @ApiProperty()
  _id!: string;

  @Prop({ required: true, type: String })
  familyId!: string;

  @Prop({ required: true, trim: true })
  @ApiProperty({ example: 'Netflix' })
  name!: string;

  @Prop({ required: true, min: 0 })
  @ApiProperty({ example: 649 })
  amount!: number;

  @Prop({ type: String, default: 'Other', trim: true })
  @ApiProperty({ example: 'Entertainment' })
  category!: string;

  @Prop({ type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' })
  @ApiProperty({ enum: ['monthly', 'quarterly', 'yearly'] })
  billingCycle!: BillingCycle;

  @Prop({ required: true, min: 1, max: 31 })
  @ApiProperty({ example: 15, description: 'Day of month when payment is due' })
  dueDate!: number;

  @Prop({ type: Date })
  nextDueDate!: Date;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: false })
  autoDebit!: boolean;

  @Prop({ type: String, default: '', trim: true })
  notes!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.index({ familyId: 1 });
SubscriptionSchema.index({ familyId: 1, isActive: 1 });
