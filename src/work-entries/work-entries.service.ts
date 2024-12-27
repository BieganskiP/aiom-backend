import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkEntry } from './entities/work-entry.entity';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { UpdateWorkEntryDto } from './dto/update-work-entry.dto';
import { startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class WorkEntriesService {
  constructor(
    @InjectRepository(WorkEntry)
    private workEntriesRepository: Repository<WorkEntry>,
  ) {}

  async create(userId: string, createWorkEntryDto: CreateWorkEntryDto) {
    const workEntry = this.workEntriesRepository.create({
      userId,
      ...createWorkEntryDto,
    });
    return this.workEntriesRepository.save(workEntry);
  }

  async findAllForUser(userId: string, month?: Date) {
    const query = this.workEntriesRepository
      .createQueryBuilder('workEntry')
      .leftJoinAndSelect('workEntry.route', 'route')
      .leftJoinAndSelect('workEntry.car', 'car')
      .where('workEntry.userId = :userId', { userId });

    if (month) {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      query.andWhere('workEntry.workDate BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    return query.getMany();
  }

  async findAll(filters: {
    userId?: string;
    routeId?: string;
    carId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.workEntriesRepository
      .createQueryBuilder('workEntry')
      .leftJoinAndSelect('workEntry.user', 'user')
      .leftJoinAndSelect('workEntry.route', 'route')
      .leftJoinAndSelect('workEntry.car', 'car');

    if (filters.userId) {
      query.andWhere('workEntry.userId = :userId', { userId: filters.userId });
    }
    if (filters.routeId) {
      query.andWhere('workEntry.routeId = :routeId', {
        routeId: filters.routeId,
      });
    }
    if (filters.carId) {
      query.andWhere('workEntry.carId = :carId', { carId: filters.carId });
    }
    if (filters.startDate && filters.endDate) {
      query.andWhere('workEntry.workDate BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const workEntry = await this.workEntriesRepository.findOne({
      where: { id },
      relations: ['route', 'car'],
    });
    if (!workEntry) {
      throw new NotFoundException('Work entry not found');
    }
    return workEntry;
  }

  async update(
    id: string,
    userId: string,
    updateWorkEntryDto: UpdateWorkEntryDto,
  ) {
    const workEntry = await this.findOne(id);

    // Check if the work entry belongs to the user
    if (workEntry.userId !== userId) {
      throw new ForbiddenException('You can only edit your own work entries');
    }

    Object.assign(workEntry, updateWorkEntryDto);
    return this.workEntriesRepository.save(workEntry);
  }

  async remove(id: string, userId: string) {
    const workEntry = await this.findOne(id);

    // Check if the work entry belongs to the user
    if (workEntry.userId !== userId) {
      throw new ForbiddenException('You can only delete your own work entries');
    }

    await this.workEntriesRepository.remove(workEntry);
    return { message: 'Work entry deleted successfully' };
  }
}
