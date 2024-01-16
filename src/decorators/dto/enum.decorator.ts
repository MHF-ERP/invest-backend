import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';

export function ValidateEnum(enumType: object) {
  return applyDecorators(
    Transform(({ value }) => value.toUpperCase()),
    IsEnum(enumType),
  );
}
