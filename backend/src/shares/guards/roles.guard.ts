import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@components/auth/roles/role.enum';
import { ROLES_KEY } from '@components/auth/roles/roles.decorator';
import { IncomingMessage } from 'http';
import { AuthService } from '@components/auth/auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('AuthService') private readonly authService: AuthService
  ) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromRequest(request);

    return this.authService.verifyToken(token, requiredRoles);
  }

  private getTokenFromRequest(request: IncomingMessage): string {
    return request.headers.authorization?.replace('Bearer ', '') || '';
  }
}
