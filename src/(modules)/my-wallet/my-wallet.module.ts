import { Module } from '@nestjs/common';
import { MyWalletController } from './my-wallet.controller';
import { MyWalletService } from './my-wallet.service';

@Module({
  imports: [],
  controllers: [MyWalletController],
  providers: [MyWalletService],
  exports: [],
})
export class MyWalletModule {}
