import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkEntry } from './entities/work-entry.entity';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { UpdateWorkEntryDto } from './dto/update-work-entry.dto';
import { startOfMonth, endOfMonth } from 'date-fns';
import { User, UserRole } from '../users/entities/user.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class WorkEntriesService implements OnModuleInit {
  constructor(
    @InjectRepository(WorkEntry)
    private workEntriesRepository: Repository<WorkEntry>,
    private settingsService: SettingsService,
  ) {}

  onModuleInit() {
    // Initialize the static settings service in WorkEntry
    WorkEntry.setSettingsService(this.settingsService);
  }

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

  async findAll(
    filters: {
      userId?: string;
      routeId?: string;
      carId?: string;
      regionId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    currentUser: User,
  ) {
    const query = this.workEntriesRepository
      .createQueryBuilder('workEntry')
      .leftJoinAndSelect('workEntry.user', 'user')
      .leftJoinAndSelect('workEntry.route', 'route')
      .leftJoinAndSelect('workEntry.car', 'car')
      .leftJoinAndSelect('route.region', 'region');

    // For leaders, only show entries from their regions
    if (currentUser.role === UserRole.LEADER) {
      query.andWhere('region.leaderId = :leaderId', {
        leaderId: currentUser.id,
      });
    }

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
    if (filters.regionId) {
      query.andWhere('route.regionId = :regionId', {
        regionId: filters.regionId,
      });
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

  async getFinancialSummary(
    filters: {
      startDate?: Date;
      endDate?: Date;
      regionId?: string;
      userId?: string;
    },
    currentUser: User,
  ) {
    const query = this.workEntriesRepository
      .createQueryBuilder('workEntry')
      .leftJoinAndSelect('workEntry.user', 'user')
      .leftJoinAndSelect('workEntry.car', 'car')
      .leftJoinAndSelect('workEntry.route', 'route')
      .leftJoinAndSelect('route.region', 'region');

    // For leaders, only show entries from their regions
    if (currentUser.role === UserRole.LEADER) {
      query.andWhere('region.leaderId = :leaderId', {
        leaderId: currentUser.id,
      });
    }

    // Apply filters
    if (filters.regionId) {
      query.andWhere('route.regionId = :regionId', {
        regionId: filters.regionId,
      });
    }
    if (filters.userId) {
      query.andWhere('workEntry.userId = :userId', {
        userId: filters.userId,
      });
    }
    if (filters.startDate && filters.endDate) {
      query.andWhere('workEntry.workDate BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    }

    const entries = await query.getMany();

    // Calculate totals
    const summary = entries.reduce(
      (acc, entry) => {
        acc.totalStops += entry.stopsCompleted;
        acc.totalRevenue += entry.totalRevenue;
        acc.totalDriverPay += entry.driverPay;
        acc.totalProfit += entry.companyProfit;
        return acc;
      },
      {
        totalStops: 0,
        totalRevenue: 0,
        totalDriverPay: 0,
        totalProfit: 0,
        entries: entries,
      },
    );

    return summary;
  }
}
