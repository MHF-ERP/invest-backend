import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddWatchListDTO {
  @ApiProperty({ name: 'name', example: 'Currencies' })
  @IsString()
  name: string;

  @ApiProperty({ name: 'symbol', example: ['1'] })
  @IsString({ each: true })
  symbols: string[];

  userId: string;
}
