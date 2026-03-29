import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { Relationship } from '../family.schema';

export class InviteMemberDto {
  @ApiProperty({ example: 'Priya Sharma' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'priya@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: ['spouse', 'father', 'mother', 'brother', 'sister', 'son', 'daughter', 'grandparent', 'other'],
    example: 'sister',
  })
  @IsEnum(['spouse', 'father', 'mother', 'brother', 'sister', 'son', 'daughter', 'grandparent', 'other'])
  relationship!: Relationship;

  @ApiProperty({ example: 'family-uuid-here' })
  @IsString()
  @IsNotEmpty()
  familyId!: string;
}
