import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { Role } from '@components/auth/roles/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
