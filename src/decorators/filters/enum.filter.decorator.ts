import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export function EnumArrayFilter<Type>(Enum: any, example: Type[]) {
  return applyDecorators(
    ApiProperty({ example }),
    IsOptional(),
    IsEnum(Enum, { each: true }),
  );
}
