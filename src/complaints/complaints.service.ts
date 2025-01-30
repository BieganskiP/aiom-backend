import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintStatus } from './enums/complaint-status.enum';
import { FindComplaintsDto } from './dto/find-complaints.dto';
import {
  CreateManyResult,
  BulkUpdateResult,
  ComplaintStats,
} from './types/complaint.types';
import { GetStatsDto } from './dto/get-stats.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
  ) {}

  async createMany(
    createComplaintDtos: CreateComplaintDto[],
  ): Promise<CreateManyResult> {
    const result: CreateManyResult = {
      created: [],
      skipped: [],
      totalProcessed: createComplaintDtos.length,
      totalCreated: 0,
      totalSkipped: 0,
    };

    for (const dto of createComplaintDtos) {
      // Check for existing complaint with the same key fields
      const existingComplaint = await this.complaintRepository.findOne({
        where: [
          {
            complaint_number: dto.complaint_number,
            client: dto.client,
            description: dto.description,
            problem_type: dto.problem_type,
            compensation_value: dto.compensation_value,
            courier: dto.courier,
            address: dto.address,
            delivery_date: dto.delivery_date,
          },
        ],
      });

      if (existingComplaint) {
        // Add to skipped list if duplicate found
        result.skipped.push(dto);
        result.totalSkipped++;
      } else {
        // Create new complaint if no duplicate found
        const complaint = this.complaintRepository.create(dto);
        const savedComplaint = await this.complaintRepository.save(complaint);
        result.created.push(savedComplaint);
        result.totalCreated++;
      }
    }

    return result;
  }

  async findAll(params: FindComplaintsDto) {
    const {
      page = 1,
      limit = 10,
      searchAddress,
      client,
      userId,
      courier,
      startDate,
      endDate,
      month,
      problem_type,
      status,
      sortBy = 'delivery_date',
      sortOrder = 'DESC',
    } = params;

    const query = this.complaintRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.user', 'user');

    // Apply filters
    if (searchAddress) {
      query.andWhere('complaint.address ILIKE :address', {
        address: `%${searchAddress}%`,
      });
    }

    if (client) {
      query.andWhere('complaint.client ILIKE :client', {
        client: `%${client}%`,
      });
    }

    if (userId) {
      query.andWhere('complaint.userId = :userId', { userId });
    }

    if (courier) {
      query.andWhere('complaint.courier ILIKE :courier', {
        courier: `%${courier}%`,
      });
    }

    if (startDate && endDate) {
      query.andWhere(
        'complaint.delivery_date BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    if (month) {
      query.andWhere('EXTRACT(MONTH FROM complaint.delivery_date) = :month', {
        month,
      });
    }

    if (problem_type) {
      query.andWhere('complaint.problem_type = :problem_type', {
        problem_type,
      });
    }

    if (status) {
      query.andWhere('complaint.status = :status', { status });
    }

    // Apply sorting
    query.orderBy(`complaint.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Get results and count
    const [complaints, total] = await query.getManyAndCount();

    return {
      data: complaints,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid complaint ID');
    }

    const complaint = await this.complaintRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }

    return complaint;
  }

  async assignUser(id: number, userId: string) {
    const complaint = await this.findOne(id);
    complaint.userId = userId;
    return this.complaintRepository.save(complaint);
  }

  async updateStatus(id: number, status: ComplaintStatus) {
    const complaint = await this.findOne(id);
    complaint.status = status;
    return this.complaintRepository.save(complaint);
  }

  async remove(id: number) {
    const complaint = await this.findOne(id);
    return this.complaintRepository.remove(complaint);
  }

  async bulkAssignUser(
    complaintIds: number[],
    userId: string,
  ): Promise<BulkUpdateResult> {
    // Validate complaint IDs
    if (!complaintIds.every((id) => !isNaN(id))) {
      throw new BadRequestException('Invalid complaint IDs provided');
    }

    // First, find all complaints that exist
    const complaints = await this.complaintRepository.find({
      where: { id: In(complaintIds) },
    });

    if (complaints.length === 0) {
      return {
        success: false,
        message: 'No complaints found with the provided IDs',
        updatedCount: 0,
        totalCount: complaintIds.length,
      };
    }

    try {
      // Update each complaint
      const updatedComplaints = complaints.map((complaint) => ({
        ...complaint,
        userId,
      }));

      // Save all updates
      await this.complaintRepository.save(updatedComplaints);

      return {
        success: true,
        message: `Successfully assigned user to ${complaints.length} complaints`,
        updatedCount: complaints.length,
        totalCount: complaintIds.length,
      };
    } catch {
      return {
        success: false,
        message: 'Failed to update complaints',
        updatedCount: 0,
        totalCount: complaintIds.length,
      };
    }
  }

  async bulkUpdateStatus(
    complaintIds: number[],
    status: ComplaintStatus,
  ): Promise<BulkUpdateResult> {
    const complaints = await this.complaintRepository.find({
      where: { id: In(complaintIds) },
    });

    if (complaints.length === 0) {
      return {
        success: false,
        message: 'No complaints found with the provided IDs',
        updatedCount: 0,
        totalCount: complaintIds.length,
      };
    }

    // Update all found complaints with new status
    const updateResult = await this.complaintRepository
      .createQueryBuilder()
      .update(Complaint)
      .set({ status })
      .where('id IN (:...ids)', { ids: complaintIds })
      .execute();

    return {
      success: true,
      message: `Successfully updated status to ${status} for ${updateResult.affected} complaints`,
      updatedCount: updateResult.affected || 0,
      totalCount: complaintIds.length,
    };
  }

  async getStats(params: GetStatsDto): Promise<ComplaintStats> {
    const { year, month, status } = params;

    // Validate numeric parameters
    if (year && (isNaN(year) || year < 1900 || year > 9999)) {
      throw new BadRequestException('Invalid year provided');
    }

    if (month && (isNaN(month) || month < 1 || month > 12)) {
      throw new BadRequestException('Invalid month provided');
    }

    // Start building the query
    const query = this.complaintRepository.createQueryBuilder('complaint');

    // Apply time filters if provided
    if (year) {
      query.andWhere('EXTRACT(YEAR FROM complaint.delivery_date) = :year', {
        year: Math.floor(year),
      });
    }
    if (month) {
      query.andWhere('EXTRACT(MONTH FROM complaint.delivery_date) = :month', {
        month: Math.floor(month),
      });
    }
    if (status) {
      query.andWhere('complaint.status = :status', { status });
    }

    // Get total count
    const total = await query.getCount();

    // Get counts by status
    const statusCounts = await Promise.all(
      Object.values(ComplaintStatus).map(async (statusValue) => {
        const statusQuery = this.complaintRepository
          .createQueryBuilder('complaint')
          .where('complaint.status = :status', { status: statusValue });

        if (year) {
          statusQuery.andWhere(
            'EXTRACT(YEAR FROM complaint.delivery_date) = :year',
            { year: Math.floor(year) },
          );
        }
        if (month) {
          statusQuery.andWhere(
            'EXTRACT(MONTH FROM complaint.delivery_date) = :month',
            { month: Math.floor(month) },
          );
        }

        const count = await statusQuery.getCount();
        return { status: statusValue, count };
      }),
    );

    // Get average compensation
    const avgResult = await query
      .select('AVG(complaint.compensation_value)', 'average')
      .getRawOne();

    const byStatus = statusCounts.reduce(
      (acc, { status, count }) => {
        acc[status] = count;
        return acc;
      },
      {} as { [key in ComplaintStatus]: number },
    );

    return {
      total,
      byStatus,
      averageCompensation: Number(avgResult?.average || 0),
      period: {
        year: year ? Math.floor(year) : undefined,
        month: month ? Math.floor(month) : undefined,
      },
    };
  }
}
