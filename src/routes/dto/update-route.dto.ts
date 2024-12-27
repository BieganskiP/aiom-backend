import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteDto } from './create-route.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateRouteDto extends PartialType(CreateRouteDto) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
