import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from '../globals/global.module';
import { MediaModule } from 'src/(modules)/media/media.module';
import { AuthenticationModule } from 'src/(modules)/authentication/authentication.module';
import { UserModule } from 'src/(modules)/user/user.module';
import { WatchListModule } from 'src/(modules)/watch-list/watch-list.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { MyWalletModule } from 'src/(modules)/my-wallet/my-wallet.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: env('MAIL_HOST'),
        secure: false,
        port: env('MAIL_PORT'),

        auth: {
          user: env('MAIL_USER'),
          pass: env('MAIL_PASSWORD'),
        },
      },
      defaults: {
        from: `${env('SENDER_NAME')} <${env('SENDER_EMAIL')}>`,
      },
    }),

    GlobalModule,
    MediaModule,
    AuthenticationModule,
    UserModule,
    WatchListModule,
    MyWalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
