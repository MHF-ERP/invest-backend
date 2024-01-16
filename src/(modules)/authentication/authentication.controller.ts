import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  Res,
  UploadedFile,
  forwardRef,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SessionTypes } from '@prisma/client';
import { Request, Response } from 'express';
import { ResponseService } from 'src/globals/services/response.service';
import { UploadImage } from '../media/decorators/upload.decorator';
import { UserIdInfoDTO } from '../user/dto/create/id-info.dto';
import { UserInitDTO } from '../user/dto/create/init.dto';
import { UserPersonalInfoDTO } from '../user/dto/create/personal-info.dto';
import { UserService } from '../user/user.service';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { EmailDTO, LoginDTO } from './dto/login.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { VerifyOtpDTO } from './dto/verify-otp.dto';
import { AuthenticationService } from './services/authentication.service';
import { TokenService } from './services/jwt.service';
import { uploadPath } from '../media/configs/upload.config';
import { UserPinCodeDTO } from '../user/dto/create/set-bin.dto';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(
    private authenticationService: AuthenticationService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private tokenService: TokenService,
    private responseService: ResponseService,
  ) {}

  @Post('/login')
  @ApiBody({ type: LoginDTO })
  async login(@Res() res: Response, @Body() credentials: LoginDTO) {
    const { fcm, socketId } = credentials;

    const user = await this.authenticationService.login(credentials);

    const tokenType = this.authenticationService.tokenType(user.status);

    const accessToken = await this.tokenService.generateToken(
      user.id,
      user.role,
      fcm,
      socketId,
      tokenType,
      res,
    );

    return this.responseService.success(
      res,
      `Welcome ${user.name} `,
      user,
      undefined,
      undefined,
      accessToken,
    );
  }

  // ----------------------------------------------------------------------------------------------

  @Post('init')
  async init(@Res() res: Response, @Body() body: UserInitDTO) {
    const user = await this.userService.init(body);
    const token = await this.tokenService.generateToken(
      user.id,
      user.role,
      '',
      '',
      SessionTypes.REGISTER,
      res,
    );

    return this.responseService.success(
      res,
      'User created successfully',
      user,
      undefined,
      undefined,
      token,
    );
  }

  // ----------------------------------------------------------------------------------------------

  @Post('verify-email')
  @Auth({ type: SessionTypes.REGISTER })
  async verifyEmailOTP(
    @Res() res: Response,
    @Body() body: VerifyOtpDTO,
    @CurrentUser('id') userId: Id,
  ) {
    const { otp } = body;
    const token = await this.authenticationService.verifyEmail(userId, otp);

    return this.responseService.success(res, 'OTP verified successfully', {
      token,
    });
  }

  // ----------------------------------------------------------------------------------------------

  @Post('verify-email/resend-otp')
  async ResendVerifyEmailOTP(@Res() res: Response, @Body() body: LoginDTO) {
    const { email } = body;
    await this.authenticationService.resendVerifyEmailOTP(email);
    return this.responseService.success(res, 'OTP sent successfully');
  }

  // ----------------------------------------------------------------------------------------------

  @Post('personal-info')
  @Auth({ type: SessionTypes.REGISTER })
  async personalInfo(
    @Res() res: Response,
    @Body() body: UserPersonalInfoDTO,
    @CurrentUser('id') userId: Id,
  ) {
    await this.userService.uploadPersonalInfo(userId, body);
    return this.responseService.success(res, 'User data updated successfully');
  }

  // ----------------------------------------------------------------------------------------------

  @Post('id-info')
  @UploadImage(uploadPath.users, 'idImage')
  @Auth({ type: SessionTypes.REGISTER })
  async idInfo(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UserIdInfoDTO,
    @CurrentUser('id') userId: Id,
  ) {
    await this.userService.uploadIdInfo(userId, file, body);
    return this.responseService.success(res, 'User data updated successfully');
  }

  // ----------------------------------------------------------------------------------------------

  @Post('set-pin')
  @Auth({ type: SessionTypes.REGISTER })
  async setPin(
    @Res() res: Response,
    @Body() body: UserPinCodeDTO,
    @CurrentUser('id') userId: Id,
  ) {
    await this.userService.setPin(userId, body);
    return this.responseService.success(res, 'User data updated successfully');
  }

  // ----------------------------------------------------------------------------------------------

  @Post('forgot-password')
  async forgotPassword(@Res() res: Response, @Body() body: EmailDTO) {
    const { email } = body;
    await this.authenticationService.forgotPassword(email);
    return this.responseService.success(res, 'OTP sent successfully');
  }

  // ----------------------------------------------------------------------------------------------

  @Post('verify-forgot-password')
  async verifyForgotPassword(@Res() res: Response, @Body() body: VerifyOtpDTO) {
    const email = 'body';
    const { otp } = body;

    const token = await this.authenticationService.verifyForgotPassword(
      email,
      otp,
    );

    return this.responseService.success(res, 'OTP sent successfully', token);
  }

  // ----------------------------------------------------------------------------------------------

  @Post('reset-password')
  async resetPassword(@Res() res: Response, @Body() body: ResetPasswordDTO) {
    const { email, token, password } = body;
    await this.authenticationService.resetPassword(email, token, password);
    return this.responseService.success(res, 'Password reset successfully');
  }

  // ----------------------------------------------------------------------------------------------

  @Post('logout')
  @Auth({})
  async logout(@Res() res: Response, @Req() req: Request) {
    await this.authenticationService.logout(req);
    return this.responseService.success(res, 'Logout successfully');
  }
}
