import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches all exceptions and returns a consistent error format:
 * {
 *   success: false,
 *   statusCode: 400,
 *   message: "Validation failed",
 *   data: null,
 *   error: ["email must be valid"] | "Something went wrong"
 * }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | string[] | Record<string, unknown> | null = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;

        // class-validator returns { message: string | string[], error: string }
        if (Array.isArray(resp.message)) {
          message = (resp.error as string) || 'Validation failed';
          error = resp.message as string[];
        } else {
          message = (resp.message as string) || message;
          error = (resp.error as string) || null;
        }
      }
    } else {
      // Unexpected errors — log full stack
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
      message = 'Something went wrong';
    }

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      data: null,
      error,
    });
  }
}
