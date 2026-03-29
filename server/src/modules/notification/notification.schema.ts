import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export type NotificationType =
  | 'budget_warning'
  | 'budget_exceeded'
  | 'bill_due'
  | 'goal_reached'
  | 'expense_added'
  | 'member_joined'
  | 'system';

@Schema({ timestamps: true })
export class Notification {
  _id!: string;

  @Prop({ required: true, type: String })
  familyId!: string;

  @Prop({ required: true, type: String })
  userId!: string;

  @Prop({ required: true, type: String })
  type!: NotificationType;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ type: Boolean, default: false })
  isRead!: boolean;

  @Prop({ type: Object, default: {} })
  meta!: Record<string, any>;

  createdAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
