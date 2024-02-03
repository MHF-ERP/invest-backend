import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { AddWatchListDTO } from './dto/add-watch-list.dto';

@Injectable()
export class WatchListService {
  constructor(private prismaService: PrismaService) {}

  async addWatchList(watchListBody: AddWatchListDTO) {
    const { symbols, ...watchList } = watchListBody;
    const insertedWatchList = await this.prismaService.watchList.create({
      data: {
        ...watchList,
        Stocks: { createMany: { data: symbols.map((symbol) => ({ symbol })) } },
      },
    });

    return insertedWatchList;
  }

  async getWatchList(id: Id) {
    const watchList = await this.prismaService.watchList.findFirst({
      where: { id },
      include: { Stocks: true },
    });

    return watchList;
  }
  async getAllWatchLists(id: Id) {
    const watchList = await this.prismaService.watchList.findMany({
      where: { userId: id },
      include: { Stocks: true },
    });

    return watchList;
  }

  async deleteWatchList(id: Id) {
    await this.prismaService.watchList.delete({
      where: { id },
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
