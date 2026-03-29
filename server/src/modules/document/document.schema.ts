import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FinDocumentDoc = FinDocument & Document;
export type DocCategory = 'receipt' | 'bill' | 'tax' | 'loan' | 'insurance' | 'id_proof' | 'other';

@Schema({ timestamps: true })
export class FinDocument {
  @ApiProperty()
  _id!: string;

  @Prop({ required: true, type: String })
  familyId!: string;

  @Prop({ required: true, type: String })
  uploadedBy!: string;

  @Prop({ required: true, trim: true })
  fileName!: string;

  @Prop({ required: true })
  fileUrl!: string;

  @Prop({ required: true })
  fileType!: string;

  @Prop({ required: true })
  fileSize!: number;

  @Prop({ type: String, enum: ['receipt', 'bill', 'tax', 'loan', 'insurance', 'id_proof', 'other'], default: 'other' })
  @ApiProperty({ enum: ['receipt', 'bill', 'tax', 'loan', 'insurance', 'id_proof', 'other'] })
  category!: DocCategory;

  @Prop({ type: String, default: '', trim: true })
  description!: string;

  @ApiProperty()
  createdAt!: Date;
}

export const FinDocumentSchema = SchemaFactory.createForClass(FinDocument);
FinDocumentSchema.index({ familyId: 1, category: 1 });
FinDocumentSchema.index({ familyId: 1, createdAt: -1 });
