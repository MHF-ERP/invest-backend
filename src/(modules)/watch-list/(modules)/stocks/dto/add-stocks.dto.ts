import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddStocksDTO {
  @ApiProperty({ example: ['asdf', 'asdf'] })
  @IsString({ each: true })
  watch_list_ids: string[];
}
