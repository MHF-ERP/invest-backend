import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles, SessionTypes } from '@prisma/client';
import { PermissionAndTypeGuard } from '../guards/mix-guard';
import { WsJwtGuard } from '../guards/ws.guard';
import { RequiredPermissions } from './permission.decorator';
import { RequiredRole } from './role.decorator';

export function Auth({
  type = SessionTypes.ACCESS,
  permissions = [],
  role = undefined,
}: {
  type?: SessionTypes;
  permissions?: string[];
  role?: Roles;
}) {
  const tokenType =
    type == SessionTypes.ACCESS
      ? SessionTypes.ACCESS
      : (type = SessionTypes.REGISTER
          ? SessionTypes.REGISTER
          : SessionTypes.REFRESH);
  const guards: any = [AuthGuard(tokenType)];

  if (permissions.length > 0 || role) {
    guards.push(PermissionAndTypeGuard);
  }

  return applyDecorators(
    RequiredPermissions(...permissions),
    RequiredRole(role),
    UseGuards(...guards),
    ApiBearerAuth(tokenType + ' Token'),
  );
}

export function WsAuth() {
  return applyDecorators(UseGuards(WsJwtGuard));
}
