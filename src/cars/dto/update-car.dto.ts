import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDto } from './create-car.dto';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { CarOwner } from '../entities/car.entity';

export class UpdateCarDto extends PartialType(CreateCarDto) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsEnum(CarOwner)
  owner?: CarOwner;
}
