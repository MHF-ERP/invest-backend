import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Roles, SessionTypes } from '@prisma/client';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { cookieConfig } from 'src/configs/cookie.config';
import { jwtConfig } from 'src/configs/jwt.config';
import { PrismaService } from 'src/globals/services/prisma.service';

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}
  async blockTokens(jti: string) {
    await this.prisma.sessions.deleteMany({ where: { jti } });
  }

  async isTokenBlocked(jti: string) {
    const session = await this.prisma.sessions.findUnique({
      where: { jti },
    });
    return session?.valid || false;
  }

  async isTokenUpdated(jti: string) {
    const session = await this.prisma.sessions.findUnique({
      where: { jti },
    });
    return session?.outdated || false;
  }

  async generateToken(
    userId: Id,
    role: Roles,
    fcmToken: string,
    socketId: string,
    type: SessionTypes,
    res: Response,
  ) {
    const { jti } = await this.prisma.sessions.create({
      data: {
        role,
        fcmToken,
        socketId,
        type,
        User: { connect: { id: userId } },
      },
    });

    const token = jwt.sign(
      { jti, id: userId },
      env('ACCESS_TOKEN_SECRET'),
      jwtConfig,
    );

    res.cookie(env('ACCESS_TOKEN_COOKIE_KEY'), token, cookieConfig);

    return token;
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async deleteExpiredTokens() {
    await this.prisma.sessions.deleteMany({
      where: {
        OR: [
          { valid: false },
          {
            AND: [
              {
                createdAt: {
                  lte: new Date(Date.now() - +env('ACCESS_TOKEN_EXPIRE_TIME')),
                },
              },
              { type: SessionTypes.ACCESS },
            ],
          },
          {
            AND: [
              {
                createdAt: {
                  lte: new Date(
                    Date.now() - +env('REGISTER_TOKEN_EXPIRE_TIME'),
                  ),
                },
              },
              { type: SessionTypes.REGISTER },
            ],
          },
        ],
      },
    });
  }
}
