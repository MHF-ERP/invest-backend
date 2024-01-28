import { Module } from '@nestjs/common';
import { WatchListStocksModule } from './(modules)/stocks/stock.module';
import { WatchListController } from './watch-list.controller';
import { WatchListService } from './watch-list.service';

@Module({
  providers: [WatchListService],
  controllers: [WatchListController],
  imports: [WatchListStocksModule],
  exports: [],
})
export class WatchListModule {}
