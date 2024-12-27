import { IsEnum } from 'class-validator';
import { CarStatus } from '../entities/car.entity';

export class UpdateCarStatusDto {
  @IsEnum(CarStatus)
  status: CarStatus;
}
