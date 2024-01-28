import { Allow, IsString } from 'class-validator';
import { RequiredIdParam } from 'src/dtos/id-param.dto';

export class DeleteStockDTO extends RequiredIdParam {
  @Allow()
  @IsString()
  symbol: string;
}
