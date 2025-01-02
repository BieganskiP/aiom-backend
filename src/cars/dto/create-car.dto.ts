import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { CarOwner } from '../entities/car.entity';
import { Transform } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  name: string;

  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CarOwner)
  owner: CarOwner;

  @IsOptional()
  @ValidateIf((o) => o.checkupDate !== '')
  @IsDateString()
  @Transform(({ value }) => (value === '' ? null : value))
  checkupDate?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.oilChangeDate !== '')
  @IsDateString()
  @Transform(({ value }) => (value === '' ? null : value))
  oilChangeDate?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.tiresChangeDate !== '')
  @IsDateString()
  @Transform(({ value }) => (value === '' ? null : value))
  tiresChangeDate?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.brakesChangeDate !== '')
  @IsDateString()
  @Transform(({ value }) => (value === '' ? null : value))
  brakesChangeDate?: string | null;
}
