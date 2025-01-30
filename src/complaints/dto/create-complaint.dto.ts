import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateComplaintDto {
  @IsNumber()
  complaint_number: number;

  @IsString()
  client: string;

  @IsString()
  description: string;

  @IsString()
  problem_type: string;

  @IsNumber()
  @IsOptional()
  compensation_value?: number;

  @IsString()
  courier: string;

  @IsString()
  address: string;

  @IsDate()
  @Type(() => Date)
  delivery_date: Date;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  userId?: string;
} 