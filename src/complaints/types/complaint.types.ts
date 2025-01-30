import { Complaint } from '../entities/complaint.entity';
import { CreateComplaintDto } from '../dto/create-complaint.dto';
import { ComplaintStatus } from '../enums/complaint-status.enum';

export interface CreateManyResult {
  created: Complaint[];
  skipped: CreateComplaintDto[];
  totalProcessed: number;
  totalCreated: number;
  totalSkipped: number;
}

export interface BulkUpdateResult {
  success: boolean;
  message: string;
  updatedCount: number;
  totalCount: number;
}

export interface ComplaintStats {
  total: number;
  byStatus: {
    [key in ComplaintStatus]: number;
  };
  totalCompensation: number;
  compensationByStatus: {
    [key in ComplaintStatus]: number;
  };
  period: {
    year?: number;
    month?: number;
  };
}
