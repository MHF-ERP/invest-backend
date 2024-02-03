import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function ApiOptionalIdParam() {
  return applyDecorators(
    ApiParam({ name: 'id', type: Number, required: false }),
  );
}

export function ApiRequiredIdParam() {
  return applyDecorators(
    ApiParam({ name: 'id', type: String, required: true }),
  );
}
