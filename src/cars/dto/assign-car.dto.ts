import { IsString, IsOptional } from 'class-validator';

export class AssignCarDto {
  @IsOptional()
  @IsString()
  assignedUserId?: string | null;
}
