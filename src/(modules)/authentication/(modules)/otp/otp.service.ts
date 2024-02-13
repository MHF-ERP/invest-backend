import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Roles } from '@prisma/client';
import { MailService } from 'src/globals/services/mail.service';
import { PrismaService } from 'src/globals/services/prisma.service';
import { generateRandomNumberString } from 'src/helpers/generate-random-numbers';

@Injectable()
export class OTPService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async generateOTP(userId: Id, role: Roles) {
    const otp = env('DEFAULT_OTP')
      ? env('DEFAULT_OTP')
      : generateRandomNumberString();
    const otpIsExist = await this.prisma.oTP.findUnique({
      where: { userId_role: { userId, role } },
      select: { createdAt: true, generatedTimes: true },
    });
    const dbOtp = await this.prisma.oTP.upsert({
      where: { userId_role: { userId, role } },
      update: {
        otp,
        token: null,
        generatedTimes: { increment: 1 },
        createdAt: otpIsExist?.generatedTimes <= 3 ? new Date() : undefined,
      },
      create: { userId, role, otp },
      select: { User: { select: { email: true } }, generatedTimes: true },
    });
    if (dbOtp.generatedTimes > 2)
      throw new BadRequestException('Too many requests');

    await this.mailService.resetPassword(dbOtp.User.email, otp);
    return otp;
  }

  // ----------------------------------------------------------------------------------------------

  async verifyOTPAndReturnToken(email: string, otp: string) {
    await this.prisma.oTP.findFirst({
      where: { User: { email } },
    });
    const otpExist = await this.prisma.oTP.findFirst({
      where: {
        otp,
        User: { email },
        generatedTimes: { lte: 3 },
        createdAt: { gte: new Date(Date.now() - +env('OTP_INVALIDATE_TIME')) },
      },
    });
    if (!otpExist) throw new UnauthorizedException('Invalid OTP');
    const token = generateRandomNumberString();
    if (otpExist.token) throw new UnauthorizedException('OTP already used');
    await this.prisma.oTP.update({
      where: { id: otpExist.id },
      data: { token },
    });
    return token;
  }

  // ----------------------------------------------------------------------------------------------

  async verifyOTPToken(email: string, token: string) {
    const tokenExist = await this.prisma.oTP.findFirst({
      where: { token, User: { email } },
    });
    if (!tokenExist) throw new UnauthorizedException('Invalid Token');
    await this.prisma.oTP.delete({
      where: { id: tokenExist.id },
    });
    return tokenExist;
  }

  // ----------------------------------------------------------------------------------------------

  async generateNewEmailOTP(email: string, role: Roles) {
    const otp = env('DEFAULT_OTP')
      ? env('DEFAULT_OTP')
      : generateRandomNumberString();
    const otpIsExist = await this.prisma.registerOTP.findUnique({
      where: { email_role: { email, role } },
      select: { createdAt: true, generatedTimes: true },
    });
    const dbOtp = await this.prisma.registerOTP.upsert({
      where: { email_role: { email, role } },
      update: {
        otp,
        token: null,
        generatedTimes: { increment: 1 },
        createdAt: otpIsExist?.generatedTimes <= 3 ? new Date() : undefined,
      },
      create: { email, role, otp },
    });
    if (dbOtp.generatedTimes > 2)
      throw new BadRequestException('Too many requests');

    await this.mailService.verifyOTP(email, otp);
    return otp;
  }

  // ----------------------------------------------------------------------------------------------

  async verifyNewEmailAndReturnToken(email: string, otp: string) {
    const otpExist = await this.prisma.registerOTP.findFirst({
      where: {
        otp,
        email,
        generatedTimes: { lte: 3 },
        createdAt: { gte: new Date(Date.now() - +env('OTP_INVALIDATE_TIME')) },
      },
    });
    if (!otpExist) throw new UnauthorizedException('Invalid OTP');
    const token = generateRandomNumberString();
    if (otpExist.token) throw new UnauthorizedException('OTP already used');
    await this.prisma.registerOTP.update({
      where: { id: otpExist.id },
      data: { token },
    });
    return token;
  }

  // ----------------------------------------------------------------------------------------------

  async verifyNewEmailOTPToken(email: string, token: string) {
    const tokenExist = await this.prisma.registerOTP.findFirst({
      where: { token, email },
    });
    if (!tokenExist) throw new UnauthorizedException('Invalid Token');
    await this.prisma.registerOTP.delete({
      where: { id: tokenExist.id },
    });
    return tokenExist;
  }

  // ----------------------------------------------------------------------------------------------

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    await this.prisma.oTP.deleteMany({
      where: {
        createdAt: {
          lte: new Date(Date.now() - +env('OTP_IGNORE_TIME')),
        },
      },
    });
    await this.prisma.registerOTP.deleteMany({
      where: {
        createdAt: {
          lte: new Date(Date.now() - +env('OTP_IGNORE_TIME')),
        },
      },
    });
  }
}
