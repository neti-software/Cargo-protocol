import { AuthService } from '@components/auth/auth.service';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
  constructor(@Inject('AuthService') private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.getTokenFromRequest(request);

    return this.authService.verifyToken(token, ['admin']);
  }

  private getTokenFromRequest(request: IncomingMessage): string {
    return request.headers.authorization?.replace('Bearer ', '') || '';
  }
}
