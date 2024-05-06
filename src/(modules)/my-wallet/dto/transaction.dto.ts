import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class TransactionDTO {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @Transform(({ value }) => {
    const number = Number(value);
    return Math.abs(number);
  })
  @IsNumber()
  amount: number;

  @ApiProperty()
  @Transform(({ value }) => {
    const number = Number(value);
    return Math.abs(number);
  })
  @IsNumber()
  price: number;

  @ApiProperty()
  @Transform(({ value }) => {
    const number = Number(value || 0) || 0;
    return Math.abs(number);
  })
  @IsNumber()
  commission: number;
}
