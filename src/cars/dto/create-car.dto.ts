import { IsString, IsOptional } from 'class-validator';

export class CreateCarDto {
  @IsString()
  name: string;

  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
