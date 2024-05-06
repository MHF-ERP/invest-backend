import { Module } from '@nestjs/common';
import { MarketController } from './markets.controller';
import { MarketService } from './markets.service';

@Module({
  imports: [],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketsModule {}
