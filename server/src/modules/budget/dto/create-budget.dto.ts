import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ example: 'Food & Dining' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 8000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit!: number;

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsNumber()
  month!: number;

  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsNumber()
  year!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  familyId!: string;
}
