import { Module } from '@nestjs/common';
import { WatchListStocksController } from './stock.controller';
import { WatchListStocksService } from './stock.service';

@Module({
  providers: [WatchListStocksService],
  controllers: [WatchListStocksController],
  exports: [],
})
export class WatchListStocksModule {}
