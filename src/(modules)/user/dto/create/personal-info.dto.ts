import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class UserPersonalInfoDTO {
  @ApiProperty({ example: 'Mohamed Kamel' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '01159675941' })
  @IsNumberString()
  phone: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  city: string;
}
