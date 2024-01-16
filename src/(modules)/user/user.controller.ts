import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseService } from 'src/globals/services/response.service';
import { Auth } from '../authentication/decorators/auth.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { UserService } from './user.service';
import { UserInitDTO } from './dto/create/init.dto';
@Controller('user')
@ApiTags('Users')
export class UserController {
  constructor(
    private userService: UserService,
    private responseService: ResponseService,
  ) {}

  @Post('/init')
  async init(@Res() res: Response, @Body() userInitDTO: UserInitDTO) {
    const user = await this.userService.init(userInitDTO);
    return this.responseService.success(res, 'User created successfully', user);
  }

  @Get('/profile')
  @Auth({})
  async getProfile(@Res() res: Response, @CurrentUser('id') userId: Id) {
    const user = await this.userService.getProfile(userId);
    return this.responseService.success(
      res,
      'User returned successfully',
      user,
    );
  }
}
