import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Netflix' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 649 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 'Entertainment' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['monthly', 'quarterly', 'yearly'] })
  @IsOptional()
  @IsEnum(['monthly', 'quarterly', 'yearly'])
  billingCycle?: string;

  @ApiProperty({ example: 15 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDate!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoDebit?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  familyId!: string;
}
