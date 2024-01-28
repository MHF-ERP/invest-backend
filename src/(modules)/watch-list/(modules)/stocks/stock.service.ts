import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { AddStocksDTO } from './dto/add-stocks.dto';

@Injectable()
export class WatchListStocksService {
  constructor(private prismaService: PrismaService) {}

  async addStocks(stocksList: AddStocksDTO, watchListId: Id) {
    const { symbols } = stocksList;
    const insertedWatchList =
      await this.prismaService.watchListStocks.createMany({
        data: symbols.map((symbol) => ({ symbol, watchListId })),
      });

    return insertedWatchList;
  }

  async deleteStockFromList(watchListId: Id, symbol: Id) {
    await this.prismaService.watchListStocks.delete({
      where: { watchListId_symbol: { watchListId, symbol } },
    });
  }

  async canAccessWatchList(id: Id, userId: Id) {
    const watchList = await this.prismaService.watchList.findFirst({
      where: { id, userId },
    });

    if (!watchList) throw new ForbiddenException("you can't access this list");

    return watchList;
  }
}
