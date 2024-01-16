import { ApiProperty } from '@nestjs/swagger';
import { IdType } from '@prisma/client';
import { IsString } from 'class-validator';
import { ValidateEnum } from 'src/decorators/dto/enum.decorator';

export class UserIdInfoDTO {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  idImage: string;

  @ApiProperty()
  @IsString()
  nationalId: string;

  @ApiProperty({ type: 'enum', enum: IdType })
  @ValidateEnum(IdType)
  idType: IdType;
}
