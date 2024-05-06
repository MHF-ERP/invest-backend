import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Markets, MarketsType } from 'src/configs/markets.config';
import { ResponseService } from 'src/globals/services/response.service';
import { MarketService } from './markets.service';

@Controller('market')
@ApiTags('Markets')
export class MarketController {
  constructor(
    private responseService: ResponseService,
    private marketService: MarketService,
  ) {}

  @Get('')
  returnMarkets(@Res() res: Response) {
    const data = this.marketService.getAllMarkets();
    return this.responseService.success(
      res,
      'markets returned successfully',
      data,
    );
  }

  @Get('stocks/:market')
  @ApiParam({
    name: 'market',
    enum: Object.keys(Markets),
  })
  returnMarketStocks(
    @Res() res: Response,
    @Param('market') market: keyof MarketsType,
  ) {
    const data = this.marketService.getAllStocks(market);
    return this.responseService.success(
      res,
      'stocks returned successfully',
      data,
    );
  }
}
