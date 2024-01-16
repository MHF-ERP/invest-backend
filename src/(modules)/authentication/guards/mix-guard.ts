import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@prisma/client';

@Injectable()
export class PermissionAndTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride(
      process.env.PERMISSION_METADATA_KEY,
      [context.getClass(), context.getHandler()],
    );
    const requiredUserRole = this.reflector.getAllAndOverride(
      process.env.ROLE_METADATA_KEY,
      [context.getClass(), context.getHandler()],
    );

    const {
      user: { permissions: userPermissions, role },
    } = context.switchToHttp().getRequest();

    if (role === Roles.ADMIN) {
      return this.validatePermissions(requiredPermissions, userPermissions);
    }

    if (role === requiredUserRole) {
      return true;
    }
  }

  validatePermissions = (
    requiredPermissions: string[],
    userPermissions: string[],
  ) => {
    if (!requiredPermissions || requiredPermissions.length == 0) {
      return true;
    }

    for (const requiredPermission of requiredPermissions) {
      if (
        userPermissions.some(
          (permission: string) => permission === requiredPermission,
        )
      )
        return true;
    }
  };
}
