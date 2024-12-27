import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDto } from './create-car.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateCarDto extends PartialType(CreateCarDto) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
