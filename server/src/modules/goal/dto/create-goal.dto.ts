import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({ example: 'Family Vacation' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Goa trip' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 80000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  targetAmount!: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'], example: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  familyId!: string;
}
