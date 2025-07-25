import { Module } from '@nestjs/common';
import { MyModule } from './(modules)/my/my.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MyModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
