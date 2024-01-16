import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class RequiredIdParam {
  @Transform(({ value }) => +value)
  @IsNumber()
  id: number;
}

export class OptionalIdParam {
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  id?: number;
}
