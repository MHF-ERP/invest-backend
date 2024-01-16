import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from '../globals/global.module';
import { MediaModule } from 'src/(modules)/media/media.module';
import { AuthenticationModule } from 'src/(modules)/authentication/authentication.module';
import { UserModule } from 'src/(modules)/user/user.module';

@Module({
  imports: [GlobalModule, MediaModule, AuthenticationModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
