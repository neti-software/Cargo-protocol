import { AppErrorCode } from '@constant/errors.constant';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    // eslint-disable-next-line
    const exceptionResponse: any = exception.getResponse();

    response.status(status).json({
      code: exceptionResponse?.code || AppErrorCode.Default,
      statusCode: status,
      message: exceptionResponse?.message || 'Unknown',
      messageDetails: exceptionResponse?.messageDetails || [],
      path: request.url
    });
  }
}
