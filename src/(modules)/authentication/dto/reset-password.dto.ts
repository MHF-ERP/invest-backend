import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { EmailDTO } from './login.dto';

export class ResetPasswordDTO extends EmailDTO {
  @ApiProperty({ example: 'Default@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
