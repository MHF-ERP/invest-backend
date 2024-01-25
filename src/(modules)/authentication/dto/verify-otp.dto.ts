import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class VerifyOtpDTO {
  @ApiProperty({ type: String, required: true, example: '1234' })
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, required: true, example: '1234' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  otp: string;
}
