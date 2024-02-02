import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(to: string, subject: string, text: string) {
    try {
      await this.mailerService.sendMail({
        to,
        from: env('SENDER_EMAIL'),
        sender: env('SENDER_NAME'),
        subject,
        html: `<b>${text}</b>`,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async resetPassword(email: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: env('SENDER_EMAIL'),
        sender: env('SENDER_NAME'),
        subject: 'InstaVest Password Reset',
        html: `<span>Your OTP to reset your password is <b>${otp}</b></span>`,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async verifyOTP(to: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to,
        from: env('SENDER_EMAIL'),
        sender: env('SENDER_NAME'),
        subject: 'Welcome On Board',
        html: `<p>Hello, Welcome to our site, we sent you this otp to verify your email <strong>${otp}</strong></p>`,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
