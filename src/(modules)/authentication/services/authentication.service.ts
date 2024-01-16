import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { SessionTypes, User, UserStatus } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from 'src/globals/services/prisma.service';
import { OTPService } from '../(modules)/otp/otp.service';
import { LoginDTO } from '../dto/login.dto';
import {
  hashPassword,
  validateUserPassword,
} from './../../../helpers/password.helpers';

@Injectable()
export class AuthenticationService {
  constructor(
    private otpService: OTPService,
    private prisma: PrismaService,
  ) {}

  // ----------------------------------------------------------------------------------------------

  async login(credentials: LoginDTO) {
    const { email, password } = credentials;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    this.userCanLogin(user);

    validateUserPassword(password, user.password);

    if (!Boolean(Number(env('MULTI_SESSION')))) {
      await this.prisma.sessions.deleteMany({
        where: { userId: user.id },
      });
    }

    return user;
  }

  // ----------------------------------------------------------------------------------------------

  async verifyEmail(id: Id, otp: string) {
    const { email } = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    const token = await this.otpService.verifyNewEmailAndReturnToken(
      email,
      otp,
    );

    await this.otpService.verifyNewEmailOTPToken(email, token);

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.WAITING_DETAILS },
    });

    return token;
  }

  // ----------------------------------------------------------------------------------------------

  async resendVerifyEmailOTP(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnprocessableEntityException('Invalid email');
    }

    await this.otpService.generateNewEmailOTP(email, user.role);
  }

  // ----------------------------------------------------------------------------------------------

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return;
    }

    await this.otpService.generateOTP(email, user.role);
  }

  // ----------------------------------------------------------------------------------------------

  async verifyForgotPassword(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnprocessableEntityException('Invalid credentials');
    }

    return await this.otpService.verifyOTPAndReturnToken(email, otp);
  }

  // ----------------------------------------------------------------------------------------------

  async resetPassword(email: string, token: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return;
    }

    await this.otpService.verifyOTPToken(email, token);

    const hashedPassword = hashPassword(password);

    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  // ----------------------------------------------------------------------------------------------

  async logout(req: Request) {
    const { jti } = req.user as CurrentUser;
    await this.prisma.sessions.delete({ where: { jti } });
  }

  // ----------------------------------------------------------------------------------------------

  tokenType(status: UserStatus) {
    if (status !== UserStatus.ACTIVE) return SessionTypes.REGISTER;
    return SessionTypes.ACCESS;
  }

  // ----------------------------------------------------------------------------------------------

  private userCanLogin(user: User) {
    if (!user) {
      throw new UnprocessableEntityException('Invalid Credentials');
    }

    if (user.status in [UserStatus.INACTIVE, UserStatus.BLOCKED]) {
      throw new UnprocessableEntityException(user.status);
    }
  }

  // ----------------------------------------------------------------------------------------------
}
