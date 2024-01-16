import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty({ example: 'Default@123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Default@123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
