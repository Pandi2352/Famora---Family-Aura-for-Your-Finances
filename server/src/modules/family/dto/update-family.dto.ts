import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFamilyDto {
  @ApiPropertyOptional({ example: "Pandi's Family" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: 'Together we grow' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slogan?: string;
}
