import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ComplaintStatus } from '../enums/complaint-status.enum';

export class GetStatsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  month?: number;

  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;
} 