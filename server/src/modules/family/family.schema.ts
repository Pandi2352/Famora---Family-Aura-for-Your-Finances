import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

// ─── Family ───

export type FamilyDocument = Family & Document;

@Schema({ timestamps: true })
export class Family {
  @ApiProperty()
  _id!: string;

  @Prop({ required: true, trim: true })
  @ApiProperty({ example: "Rahul's Family" })
  name!: string;

  @Prop({ type: String, default: null, trim: true })
  @ApiProperty({ example: 'Together we grow', nullable: true })
  slogan!: string | null;

  @Prop({ required: true, type: String })
  @ApiProperty({ description: 'UUID of the user who created this family' })
  ownerId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const FamilySchema = SchemaFactory.createForClass(Family);

// ─── Family Member ───

export type FamilyMemberDocument = FamilyMember & Document;

export type Relationship =
  | 'spouse'
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'son'
  | 'daughter'
  | 'grandparent'
  | 'other';

@Schema({ timestamps: true })
export class FamilyMember {
  @ApiProperty()
  _id!: string;

  @Prop({ required: true, type: String })
  familyId!: string;

  @Prop({ required: true, type: String })
  userId!: string;

  @Prop({ required: true, enum: ['spouse', 'father', 'mother', 'brother', 'sister', 'son', 'daughter', 'grandparent', 'other'] })
  @ApiProperty({ enum: ['spouse', 'father', 'mother', 'brother', 'sister', 'son', 'daughter', 'grandparent', 'other'] })
  relationship!: Relationship;

  @Prop({ default: Date.now })
  joinedAt!: Date;
}

export const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);

FamilyMemberSchema.index({ familyId: 1, userId: 1 }, { unique: true });
