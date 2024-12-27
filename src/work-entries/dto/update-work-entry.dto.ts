import { IsNumber, IsDate, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWorkEntryDto {
  @IsOptional()
  @IsNumber()
  stopsCompleted?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  workDate?: Date;

  @IsOptional()
  @IsString()
  routeId?: string;

  @IsOptional()
  @IsString()
  carId?: string;
}
