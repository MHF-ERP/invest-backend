import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseService } from 'src/globals/services/response.service';
import { MyWalletService } from './my-wallet.service';
import { Auth } from '../authentication/decorators/auth.decorator';
import { Response } from 'express';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { TransactionDTO } from './dto/transaction.dto';
import { RequiredIdParam } from 'src/dtos/id-param.dto';
import { ApiRequiredIdParam } from 'src/decorators/params/id-params.decorator';

@Controller('my-wallet')
@ApiTags('My Wallet')
export class MyWalletController {
  constructor(
    private myWalletService: MyWalletService,
    private responseService: ResponseService,
  ) {}

  @Get()
  @Auth({})
  async getMyWallet(@Res() res: Response, @CurrentUser('id') userId: Id) {
    const wallet = await this.myWalletService.getMyWallet(userId);
    return this.responseService.success(res, 'My Wallet', wallet);
  }

  @Post('/buy')
  @Auth({})
  async buyStock(
    @Res() res: Response,
    @CurrentUser('id') userId: Id,
    @Body() body: TransactionDTO,
  ) {
    await this.myWalletService.buyStock(userId, body);
    return this.responseService.success(res, 'Bought Stock');
  }

  @Post('/sell')
  @Auth({})
  async sellStock(
    @Res() res: Response,
    @CurrentUser('id') userId: Id,
    @Body() body: TransactionDTO,
  ) {
    await this.myWalletService.sellStock(userId, body);
    return this.responseService.success(res, 'Bought Stock');
  }

  @Get('/stock-details/:id')
  @Auth({})
  @ApiRequiredIdParam()
  async detailsStock(
    @Res() res: Response,
    @CurrentUser('id') userId: Id,
    @Param() { id: symbol }: RequiredIdParam,
  ) {
    const stockDetails = await this.myWalletService.stockDetails(
      symbol,
      userId,
    );
    return this.responseService.success(res, 'stock details', stockDetails);
  }
}
