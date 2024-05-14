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
        Transactions: { orderBy: { createdAt: 'desc' } },
      },
    });

    const agg = await this.prismaService.transactions.groupBy({
      by: ['symbol'],
      where: { walletId: userId },
      _sum: { amount: true },
    });

    const stocks = agg.map((stock) => {
      return stock.symbol;
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
          commission?: number;
          provider?: string;
        },
      ];
    }[] = [];

    Transactions.forEach((transaction) => {
      if (!stocks.includes(transaction.symbol)) return;
      const { symbol, amount, price, createdAt, commission, provider } =
        transaction;
      const isIn = myStocks.find((existStock) => existStock.symbol === symbol);
      if (isIn) {
        isIn.amount += amount;
        isIn.price =
          (Math.abs(isIn.price) * Math.abs(isIn.amount) + price * amount) /
          (Math.abs(isIn.amount) + amount);
        isIn.history.push({ amount, price, createdAt, commission, provider });
      } else {
        myStocks.push({
          symbol,
          amount,
          price,
          prediction: predictions.find((pred) => pred?.symbol === symbol),
          history: [{ amount, price, createdAt, commission, provider }],
        });
      }
    });

    return {
      ...rest,
      lastTransaction: Transactions?.at(0)?.createdAt,
      myStocks,
    };
  }

  async buyStock(userId: Id, body: TransactionDTO) {
    const { symbol, amount, price, provider } = body;

    await this.prismaService.$transaction(async (prisma) => {
      await prisma.transactions.create({
        data: {
          walletId: userId,
          symbol,
          amount,
          price,
          provider,
        },
      });
      await prisma.wallet.update({
        data: { balance: { increment: amount * price } },
        where: { id: userId },
      });
    });
  }

  async sellStock(userId: Id, body: TransactionDTO) {
    const { symbol, amount, price, commission, provider } = body;
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
          commission: commission,
          provider,
        },
      });
      await prisma.wallet.update({
        data: { balance: { increment: amount * price * -1 - commission } },
        where: { id: userId },
      });
    });
  }

  async stockDetails(symbol: string, userId: Id) {
    const stockTransactions = await this.prismaService.transactions.findMany({
      where: { symbol, walletId: userId },
      orderBy: { createdAt: 'desc' },
    });
    const lastBuy = stockTransactions.find(
      (transaction) => transaction.amount > 0,
    );
    const lastSell = stockTransactions.find(
      (transaction) => transaction.amount < 0,
    );

    const stats = {
      firstBought: stockTransactions.at(-1)?.createdAt,
      lastTransaction: stockTransactions.at(0)?.createdAt,
      lastTransactionType: stockTransactions.at(0)?.amount > 0 ? 'buy' : 'sell',
      lastTransactionPrice: stockTransactions.at(0)?.price,
      lastTransactionAmount: stockTransactions.at(0)?.amount,
      lastBuy: {
        amount: lastBuy.amount,
        price: lastBuy?.price,
        date: lastBuy?.createdAt,
      },
      lastSell: {
        amount: Math.abs(lastSell.amount),
        price: lastSell?.price,
        commission: lastSell?.commission,
        date: lastSell?.createdAt,
      },

      providers: [],
      manipulated: 0,
      remaining: 0,
      sold: 0,
      bought: 0,
    };

    stockTransactions.forEach((transaction) => {
      const amount = Math.abs(transaction.amount);
      transaction.amount > 0
        ? (stats.bought += amount)
        : (stats.sold += amount);
      stats.manipulated += amount;
      stats.providers.includes(transaction.provider)
        ? stats.providers
        : stats.providers.push(transaction.provider);
    });
    stats.remaining = stats.bought - stats.sold;

    return stats;
  }

  async predictStock(symbol: string) {
    if (!symbol) return;
    const prediction = await axios.get<Prediction>(
      'https://ai.naqiconcepts.com/predict_stock?symbol=' + symbol,
    );
    return prediction?.data;
  }
}
