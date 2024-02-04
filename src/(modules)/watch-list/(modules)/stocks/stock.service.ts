import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { AddStocksDTO } from './dto/add-stocks.dto';

@Injectable()
export class WatchListStocksService {
  constructor(private prismaService: PrismaService) {}

  async addStocks(stocksList: AddStocksDTO, symbol: Id) {
    const { watch_list_ids } = stocksList;
    const insertedWatchList =
      await this.prismaService.watchListStocks.createMany({
        data: watch_list_ids.map((watchListId) => ({
          symbol,
          watchListId,
          // symbol,
          // watch_list_id,
        })),
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
