import { AppErrorCode } from '@constant/errors.constant';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { AppError } from '@shares/AppError';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof AppError) {
          switch (err.code) {
            case AppErrorCode.Conflict:
              throw new HttpException(
                { message: err.message, code: AppErrorCode.Conflict },
                HttpStatus.CONFLICT
              );
            case AppErrorCode.NotFound:
              throw new HttpException(
                { message: err.message, code: AppErrorCode.NotFound },
                HttpStatus.NOT_FOUND
              );
            case AppErrorCode.Forbidden:
              throw new HttpException(
                { message: err.message, code: AppErrorCode.Forbidden },
                HttpStatus.FORBIDDEN
              );
            case AppErrorCode.Unauthorized:
              throw new HttpException(
                { message: err.message, code: AppErrorCode.Unauthorized },
                HttpStatus.UNAUTHORIZED
              );
            case AppErrorCode.Locked:
              throw new HttpException({ message: err.message, code: AppErrorCode.Locked }, 423);
          }
        }
        if (err instanceof HttpException) {
          throw err;
        }
        throw new HttpException({ message: err.message }, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }
}
