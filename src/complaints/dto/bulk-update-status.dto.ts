import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { ComplaintStatus } from '../enums/complaint-status.enum';

export class BulkUpdateStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  complaintIds: number[];

  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;
} 