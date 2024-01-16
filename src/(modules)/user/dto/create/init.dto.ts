import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserInitDTO implements Prisma.UserCreateInput {
  @ApiProperty({ example: 'mohamed22kamel@icloud.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Default@123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
