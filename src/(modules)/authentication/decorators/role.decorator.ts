import { SetMetadata } from '@nestjs/common';
import { Roles } from '@prisma/client';

export const RequiredRole = (role: Roles) =>
  SetMetadata(process.env.ROLE_METADATA_KEY, role);
