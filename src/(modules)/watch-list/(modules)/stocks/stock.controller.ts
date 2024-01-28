import { Body, Controller, Delete, Param, Post, Res } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiRequiredIdParam } from 'src/decorators/params/id-params.decorator';
import { RequiredIdParam } from 'src/dtos/id-param.dto';
import { ResponseService } from 'src/globals/services/response.service';
import { AddStocksDTO } from './dto/add-stocks.dto';
import { DeleteStockDTO } from './dto/delete-stock.dto';
import { WatchListStocksService } from './stock.service';

@Controller('watch-list/:id')
@ApiTags('Watch List Stocks')
export class WatchListStocksController {
  constructor(
    private watchListStocksService: WatchListStocksService,
    private responseService: ResponseService,
  ) {}

  @Post('stocks')
  @ApiRequiredIdParam()
  async addStocks(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @Body() addStocks: AddStocksDTO,
  ) {
    const insertedStocks = await this.watchListStocksService.addStocks(
      addStocks,
      id,
    );

    return this.responseService.success(
      res,
      'Stocks added successfully',
      insertedStocks,
    );
  }

  @Delete('stocks/:symbol')
  @ApiRequiredIdParam()
  @ApiParam({ name: 'symbol', example: '1', required: true })
  async deleteStocks(
    @Res() res: Response,
    @Param() { id, symbol }: DeleteStockDTO,
  ) {
    const insertedStocks =
      await this.watchListStocksService.deleteStockFromList(id, symbol);

    return this.responseService.success(
      res,
      'Stock deleted successfully',
      insertedStocks,
    );
  }
}
