import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  leaderId?: string;
}
