import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

export type ActivityType =
  | 'expense_added'
  | 'expense_updated'
  | 'expense_deleted'
  | 'member_joined'
  | 'member_removed'
  | 'reaction_added'
  | 'goal_contributed'
  | 'family_updated';

@Schema({ timestamps: true })
export class Activity {
  _id!: string;

  @Prop({ required: true, type: String })
  familyId!: string;

  @Prop({ required: true, type: String })
  userId!: string;

  @Prop({ required: true, type: String })
  type!: ActivityType;

  @Prop({ type: Object, default: {} })
  meta!: Record<string, any>;

  createdAt!: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

ActivitySchema.index({ familyId: 1, createdAt: -1 });
