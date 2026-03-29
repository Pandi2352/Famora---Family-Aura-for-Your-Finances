import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'rahul@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'mypassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: "Rahul's Family" })
  @IsString()
  @IsNotEmpty()
  familyName!: string;
}
