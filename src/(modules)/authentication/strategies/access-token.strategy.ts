import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SessionTypes, Status } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/globals/services/prisma.service';
import { extractJWT } from '../helpers/extract-token';

export type Payload = {
  exp: number;
  iat: number;
} & CurrentUser;

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  SessionTypes.ACCESS,
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJWT]),
      secretOrKey: env('ACCESS_TOKEN_SECRET'),
      jsonWebTokenOptions: {
        maxAge: +env('ACCESS_TOKEN_EXPIRE_TIME'),
      },
    });
  }

  async validate(payload: Payload) {
    const { id, jti } = payload;
    if (!id || !jti) return false;

    const userExist = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        Sessions: { where: { jti } },
        status: true,
      },
    });

    if (userExist && userExist.Sessions.length) {
      if (userExist.status !== Status.ACTIVE) return false;
      if (!userExist.Sessions[0]?.valid) return false;

      const serializedUser = {
        id: userExist.id,
        jti,
        role: userExist.Sessions[0].role,
      };

      return serializedUser;
    }
    return false;
  }
}
