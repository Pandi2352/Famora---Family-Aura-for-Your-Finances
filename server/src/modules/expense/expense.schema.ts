import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ExpenseDocument = Expense & Document;

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Travel & Transport',
  'Rent & Housing',
  'Bills & Utilities',
  'Entertainment',
  'Shopping',
  'Health & Medical',
  'Education',
  'Groceries',
  'Personal Care',
  'Investments',
  'EMI & Loans',
  'Gifts & Donations',
  'Other',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental Income',
  'Gifts',
  'Refunds',
  'Other',
] as const;

export type ExpenseType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

@Schema({ timestamps: true })
export class Expense {
  @ApiProperty()
  _id!: string;

  @Prop({ required: true, type: String })
  @ApiProperty({ description: 'Family this expense belongs to' })
  familyId!: string;

  @Prop({ required: true, type: String })
  @ApiProperty({ description: 'User who created this expense' })
  createdBy!: string;

  @Prop({ required: true, enum: ['income', 'expense'] })
  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  type!: ExpenseType;

  @Prop({ required: true, min: 0 })
  @ApiProperty({ example: 450 })
  amount!: number;

  @Prop({ required: true, trim: true })
  @ApiProperty({ example: 'Food & Dining' })
  category!: string;

  @Prop({ type: String, default: '', trim: true })
  @ApiPropertyOptional({ example: 'Swiggy dinner' })
  note!: string;

  @Prop({ required: true })
  @ApiProperty({ example: '2026-03-28' })
  date!: Date;

  @Prop({ type: String, enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'], default: 'cash' })
  @ApiProperty({ enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'], example: 'upi' })
  paymentMethod!: PaymentMethod;

  @Prop({ type: [{ userId: String, emoji: String }], default: [] })
  reactions!: { userId: string; emoji: string }[];

  @Prop({ type: Boolean, default: false })
  isPinned!: boolean;

  @Prop({ type: String, default: null })
  receiptUrl!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Indexes for common queries
ExpenseSchema.index({ familyId: 1, date: -1 });
ExpenseSchema.index({ familyId: 1, category: 1 });
ExpenseSchema.index({ familyId: 1, type: 1, date: -1 });
ExpenseSchema.index({ familyId: 1, createdBy: 1 });
