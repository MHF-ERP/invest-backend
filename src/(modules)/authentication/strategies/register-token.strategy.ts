import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SessionTypes } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/globals/services/prisma.service';
import { extractJWT } from '../helpers/extract-token';

export type Payload = {
  exp: number;
  iat: number;
} & CurrentUser;

@Injectable()
export class RegisterTokenStrategy extends PassportStrategy(
  Strategy,
  SessionTypes.REGISTER,
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJWT]),
      secretOrKey: env('REGISTER_TOKEN_SECRET'),
      jsonWebTokenOptions: {
        maxAge: +env('REGISTER_TOKEN_EXPIRE_TIME'),
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
        Sessions: { where: { jti, type: SessionTypes.REGISTER } },
        status: true,
      },
    });

    if (userExist && userExist.Sessions.length) {
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
