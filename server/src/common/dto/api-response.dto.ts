import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiSuccessResponse<T = unknown> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Request successful' })
  message!: string;

  @ApiPropertyOptional()
  data!: T;

  @ApiPropertyOptional({ example: null })
  error!: null;
}

export class ApiErrorResponse {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiProperty({ example: null })
  data!: null;

  @ApiPropertyOptional({
    example: ['email must be a valid email'],
    description: 'Validation errors or error details',
  })
  error!: string | string[] | Record<string, unknown> | null;
}
