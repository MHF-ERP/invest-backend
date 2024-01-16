import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UserPinCodeDTO {
  @ApiProperty({ example: '2135' })
  @IsNotEmpty()
  @IsNumberString()
  pinCode: string;
}
