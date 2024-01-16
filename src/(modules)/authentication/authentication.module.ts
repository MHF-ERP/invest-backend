import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { OTPService } from './(modules)/otp/otp.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './services/authentication.service';
import { TokenService } from './services/jwt.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RegisterTokenStrategy } from './strategies/register-token.strategy';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthenticationController],
  providers: [
    TokenService,
    OTPService,
    AuthenticationService,
    AccessTokenStrategy,
    RegisterTokenStrategy,
  ],
  exports: [AuthenticationService, OTPService],
})
export class AuthenticationModule {}
