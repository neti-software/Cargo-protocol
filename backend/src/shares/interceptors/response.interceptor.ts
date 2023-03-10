import { AppErrorCode } from '@constant/errors.constant';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  metadata: {
    [key: string]: unknown;
  };
}
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const metadata = {
          ...data.metadata,
          timestamp: new Date()
        };
        delete data.metadata;
        return {
          code: AppErrorCode.NoError,
          data: data.data || data,
          metadata: metadata
        };
      })
    );
  }
}
