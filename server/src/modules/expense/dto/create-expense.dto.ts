import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  @IsEnum(['income', 'expense'])
  type!: 'income' | 'expense';

  @ApiProperty({ example: 450 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'Food & Dining' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ example: 'Swiggy dinner' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: '2026-03-28' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'], example: 'upi' })
  @IsOptional()
  @IsEnum(['cash', 'card', 'upi', 'bank_transfer', 'other'])
  paymentMethod?: string;

  @ApiProperty({ description: 'Family ID' })
  @IsString()
  @IsNotEmpty()
  familyId!: string;
}
