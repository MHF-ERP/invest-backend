import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerifyOtpDTO {
  @ApiProperty({ type: String, required: true, example: '1234' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  otp: string;
}
