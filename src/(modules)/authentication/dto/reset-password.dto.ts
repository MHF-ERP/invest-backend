import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { EmailDTO } from './login.dto';

export class ResetPasswordDTO extends EmailDTO {
  @ApiProperty({ type: String, required: true, example: '1234' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  token: string;

  @ApiProperty({ example: 'Default@123' })
  @IsString()
  @MinLength(8)
  password: string;
}
