import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget {
  @ApiProperty()
  _id!: string;

  @Prop({ required: true, type: String })
  familyId!: string;

  @Prop({ required: true, trim: true })
  @ApiProperty({ example: 'Food & Dining' })
  category!: string;

  @Prop({ required: true, min: 1 })
  @ApiProperty({ example: 8000, description: 'Budget limit amount' })
  limit!: number;

  @Prop({ required: true })
  @ApiProperty({ example: 3 })
  month!: number;

  @Prop({ required: true })
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);

// One budget per category per month per family
BudgetSchema.index({ familyId: 1, category: 1, month: 1, year: 1 }, { unique: true });
