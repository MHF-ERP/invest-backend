import { ApiProperty } from '@nestjs/swagger';
import {
  Allow,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EmailDTO {
  @ApiProperty({ example: 'mohamed22kamel@icloud.com' })
  @IsEmail()
  email: string;
}

export class LoginDTO extends EmailDTO {
  @ApiProperty({ example: 'Default@123' })
  @Allow()
  password: string;

  @ApiProperty({ example: 'user' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  fcm: string;

  @ApiProperty({ example: 'user' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  socketId?: string;
}
