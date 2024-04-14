import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/globals/services/prisma.service';
import { TransactionDTO } from './dto/transaction.dto';

type Prediction = {
  prediction: string;
  probability: number;
  symbol: string;
};

@Injectable()
export class MyWalletService {
  constructor(private prismaService: PrismaService) {}

  async generateWallet(userId: Id) {
    await this.prismaService.wallet.create({
      data: {
        id: userId,
      },
    });
  }

  async getMyWallet(userId: Id) {
    const wallet = await this.prismaService.wallet.findUnique({
      where: { id: userId },
      include: {
        Transactions: true,
      },
    });

    const agg = await this.prismaService.transactions.groupBy({
      by: ['symbol'],
      where: { walletId: userId },
      _sum: { amount: true },
    });

    const stocks = agg.map((stock) => {
      if (stock._sum.amount > 0) return stock.symbol;
    });

    const promises = stocks.map((stock) => {
      return this.predictStock(stock);
    });

    const predictions = await Promise.all(promises);

    if (!wallet) {
      await this.generateWallet(userId);
      return await this.getMyWallet(userId);
    }

    const { Transactions, ...rest } = wallet;
    const myStocks: {
      symbol: string;
      amount: number;
      price: number;
      prediction?: Prediction;
      history: [
        {
          amount: number;
          price: number;
          createdAt: Date;
        },
      ];
    }[] = [];

    Transactions.forEach((transaction) => {
      if (!stocks.includes(transaction.symbol)) return;
      const { symbol, amount, price, createdAt } = transaction;
      const isIn = myStocks.find((existStock) => existStock.symbol === symbol);
      if (isIn) {
        isIn.amount += amount;
        isIn.price =
          (Math.abs(isIn.price) * Math.abs(isIn.amount) + price * amount) /
          (Math.abs(isIn.amount) + amount);
        isIn.history.push({ amount, price, createdAt });
      } else {
        myStocks.push({
          symbol,
          amount,
          price,
          prediction: predictions.find((pred) => pred.symbol === symbol),
          history: [{ amount, price, createdAt }],
        });
      }
    });

    return { ...rest, myStocks };
  }

  async buyStock(userId: Id, body: TransactionDTO) {
    const { symbol, amount, price } = body;

    await this.prismaService.$transaction(async (prisma) => {
      await prisma.transactions.create({
        data: {
          walletId: userId,
          symbol,
          amount,
          price,
        },
      });
      await prisma.wallet.update({
        data: { balance: { increment: amount * price } },
        where: { id: userId },
      });
    });
  }

  async sellStock(userId: Id, body: TransactionDTO) {
    const { symbol, amount, price } = body;
    await this.prismaService.$transaction(async (prisma) => {
      const doYouHave = await prisma.transactions.groupBy({
        by: ['symbol'],
        where: { symbol, walletId: userId },
        _sum: { amount: true },
      });
      if (
        doYouHave.length === 0 ||
        doYouHave?.at(0)?._sum?.amount <= 0 ||
        doYouHave[0]._sum.amount < amount
      )
        throw new BadRequestException('You do not have enough stocks');
      await prisma.transactions.create({
        data: {
          walletId: userId,
          symbol,
          amount: -amount,
          price,
        },
      });
      await prisma.wallet.update({
        data: { balance: { increment: amount * price * -1 } },
        where: { id: userId },
      });
    });
  }

  async predictStock(symbol: string) {
    if (!symbol) return;
    const prediction = await axios.get<Prediction>(
      'https://ai.naqiconcepts.com/predict_stock?symbol=' + symbol,
    );
    return prediction?.data;
  }
}
