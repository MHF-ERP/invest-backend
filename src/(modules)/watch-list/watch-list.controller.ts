import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiRequiredIdParam } from 'src/decorators/params/id-params.decorator';
import { RequiredIdParam } from 'src/dtos/id-param.dto';
import { ResponseService } from 'src/globals/services/response.service';
import { Auth } from '../authentication/decorators/auth.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AddWatchListDTO } from './dto/add-watch-list.dto';
import { WatchListService } from './watch-list.service';

@Controller('watch-list')
@ApiTags('watch-list')
export class WatchListController {
  constructor(
    private watchListService: WatchListService,
    private responseService: ResponseService,
  ) {}

  @Auth({})
  @Post('/')
  async addWatchList(
    @Res() res: Response,
    @Body() watchList: AddWatchListDTO,
    @CurrentUser('id') userId: Id,
  ) {
    watchList.userId = userId;
    const insertedWatchList =
      await this.watchListService.addWatchList(watchList);

    return this.responseService.success(
      res,
      'watch-list created successfully',
      insertedWatchList,
    );
  }
  @Auth({})
  @Get('/all')
  async getAllWatchList(@Res() res: Response, @CurrentUser('id') userId: Id) {
    const watchList = await this.watchListService.getAllWatchLists(userId);

    return this.responseService.success(
      res,
      'watch-list returned successfully',
      watchList,
    );
  }
  @Auth({})
  @ApiRequiredIdParam()
  @Get('/:id')
  async getWatchList(
    @Res() res: Response,
    @CurrentUser('id') userId: Id,
    @Param() { id }: RequiredIdParam,
  ) {
    await this.watchListService.canAccessWatchList(id, userId);
    const watchList = await this.watchListService.getWatchList(id);

    return this.responseService.success(
      res,
      'watch-list returned successfully',
      watchList,
    );
  }

  @Auth({})
  @ApiRequiredIdParam()
  @Delete('/:id')
  async deleteWatchList(
    @Res() res: Response,
    @CurrentUser('id') userId: Id,
    @Param() { id }: RequiredIdParam,
  ) {
    await this.watchListService.canAccessWatchList(id, userId);

    await this.watchListService.deleteWatchList(id);

    return this.responseService.success(res, 'watch-list deleted successfully');
  }
}
