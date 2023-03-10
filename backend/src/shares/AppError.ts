import { AppErrorCode } from '@constant/errors.constant';

export class AppError extends Error {
  public readonly code: AppErrorCode;
  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
