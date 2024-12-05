import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetTransactionsRequest {
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  fromAccountId?: number;

  @IsNumber()
  @IsOptional()
  toAccountId?: number;
}
