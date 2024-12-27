import { IsString, IsOptional } from 'class-validator';

export class AssignRouteDto {
  @IsOptional()
  @IsString()
  assignedUserId?: string | null;
}
