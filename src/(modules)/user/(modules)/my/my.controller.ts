import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseService } from 'src/globals/services/response.service';
import { MyService } from './my.service';

@Controller('my')
@ApiTags('Mys')
export class MyController {
  constructor(
    private myService: MyService,
    private responses: ResponseService,
  ) {}
}
