import { Injectable, NotFoundException } from '@nestjs/common';
import { Markets } from 'src/configs/markets.config';

@Injectable()
export class MarketService {
  constructor() {}

  getAllMarkets() {
    return Object.keys(Markets);
  }

  getAllStocks(market: keyof typeof Markets) {
    if (!market || !Markets[market])
      throw new NotFoundException('market not found');

    return Markets[market];
  }
}
