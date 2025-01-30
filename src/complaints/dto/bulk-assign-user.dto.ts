import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class BulkAssignUserDto {
  @IsArray()
  @ArrayMinSize(1)
  complaintIds: number[];

  @IsString()
  userId: string;
} 