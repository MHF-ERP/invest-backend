import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth } from 'src/(modules)/authentication/decorators/auth.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Auth({})
  getHello(): string {
    return this.appService.getHello();
  }
}
