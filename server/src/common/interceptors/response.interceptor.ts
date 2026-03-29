import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';

/**
 * Wraps every successful response in a consistent format:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "Request successful",
 *   data: { ... },
 *   error: null
 * }
 *
 * Controllers can return raw data — this interceptor wraps it.
 * To customise the message, return { message: '...', data: ... } from the controller.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((body) => {
        const res = context.switchToHttp().getResponse<Response>();
        const statusCode = res.statusCode;

        // If controller already returned our format, pass through
        if (body && typeof body === 'object' && 'success' in body) {
          return body;
        }

        // Support { message, data } pattern from controllers
        let message = 'Request successful';
        let data = body;

        if (
          body &&
          typeof body === 'object' &&
          'message' in body &&
          'data' in body
        ) {
          message = (body as { message: string }).message;
          data = (body as { data: unknown }).data;
        }

        return {
          success: true,
          statusCode,
          message,
          data: data ?? null,
          error: null,
        };
      }),
    );
  }
}
