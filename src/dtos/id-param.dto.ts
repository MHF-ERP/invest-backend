import { IsOptional, IsString } from 'class-validator';

export class RequiredIdParam {
  @IsString()
  id: Id;
}

export class OptionalIdParam {
  @IsOptional()
  @IsString()
  id?: Id;
}
