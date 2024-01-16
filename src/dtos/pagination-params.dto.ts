import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class PaginationParamsDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsNumberString()
  page?: number | string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberString()
  limit?: number | string;
}
