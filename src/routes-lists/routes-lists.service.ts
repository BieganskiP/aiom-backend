import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { RouteList } from './entities/route-list.entity';

@Injectable()
export class RoutesListsService {
  constructor(
    @InjectRepository(RouteList)
    private routeListRepository: Repository<RouteList>,
  ) {}

  findAll(filters?: {
    startDate?: Date;
    endDate?: Date;
    route?: string;
    period?: 'first' | 'second';
    month?: number;
    year?: number;
  }) {
    const where: any = {};

    if (filters) {
      // Handle date range filter
      if (filters.startDate || filters.endDate) {
        where.date = Between(
          filters.startDate || new Date(0),
          filters.endDate || new Date(),
        );
      }

      // Handle route filter
      if (filters.route) {
        where.route = filters.route;
      }

      // Handle period filter (1-15 or 16-end of month)
      if (filters.period && typeof filters.month === 'number' && filters.year) {
        if (filters.month < 0 || filters.month > 11) {
          throw new BadRequestException('Month must be between 1 and 12');
        }

        if (filters.period === 'first') {
          // First period: 1st to 15th (inclusive)
          const startDate = new Date(filters.year, filters.month, 1);
          const endDate = new Date(
            filters.year,
            filters.month,
            15,
            23,
            59,
            59,
            999,
          );
          where.date = Between(startDate, endDate);
        } else {
          // Second period: 16th to end of month (inclusive)
          const startDate = new Date(filters.year, filters.month, 16);
          // Get last day of the month by going to first day of next month and subtracting 1 day
          const endDate = new Date(
            filters.year,
            filters.month + 1,
            0,
            23,
            59,
            59,
            999,
          );
          where.date = Between(startDate, endDate);
        }
      }
    }

    return this.routeListRepository.find({
      where,
      order: {
        date: 'DESC',
      },
    });
  }

  findOne(id: number) {
    return this.routeListRepository.findOne({ where: { id } });
  }

  async update(id: number, updateRouteListDto: { route: string }) {
    const routeList = await this.findOne(id);
    if (!routeList) {
      throw new NotFoundException(`Route list with ID ${id} not found`);
    }

    routeList.route = updateRouteListDto.route;
    return this.routeListRepository.save(routeList);
  }

  async transfer(
    sourceId: number,
    transferDto: {
      targetRoute: string;
      targetRouteId?: number;
      numberOfStops: number;
      numberOfPackages: number;
    },
  ) {
    // Get source route
    const sourceRoute = await this.findOne(sourceId);
    if (!sourceRoute) {
      throw new NotFoundException(`Source route with ID ${sourceId} not found`);
    }

    // Validate if source route has enough stops and packages to transfer
    if (sourceRoute.number_of_stops < transferDto.numberOfStops) {
      throw new BadRequestException(
        `Source route only has ${sourceRoute.number_of_stops} stops, cannot transfer ${transferDto.numberOfStops}`,
      );
    }
    if (sourceRoute.number_of_packages < transferDto.numberOfPackages) {
      throw new BadRequestException(
        `Source route only has ${sourceRoute.number_of_packages} packages, cannot transfer ${transferDto.numberOfPackages}`,
      );
    }

    let targetRoute: RouteList;

    // If targetRouteId is provided, it's a transfer between regular routes
    if (transferDto.targetRouteId) {
      targetRoute = await this.findOne(transferDto.targetRouteId);
      if (!targetRoute) {
        throw new NotFoundException(
          `Target route with ID ${transferDto.targetRouteId} not found`,
        );
      }

      // Verify same date
      if (targetRoute.date.getTime() !== sourceRoute.date.getTime()) {
        throw new BadRequestException(
          'Cannot transfer between routes with different dates',
        );
      }
    } else {
      // It's a helper route transfer - check if helper route exists for this date
      targetRoute = await this.routeListRepository.findOne({
        where: {
          route: transferDto.targetRoute,
          date: sourceRoute.date,
        },
      });
    }

    await this.routeListRepository.manager.transaction(async (manager) => {
      // Update source route
      sourceRoute.number_of_stops -= transferDto.numberOfStops;
      sourceRoute.number_of_packages -= transferDto.numberOfPackages;
      await manager.save(sourceRoute);

      if (targetRoute) {
        // Update existing route
        targetRoute.number_of_stops += transferDto.numberOfStops;
        targetRoute.number_of_packages += transferDto.numberOfPackages;
        targetRoute = await manager.save(targetRoute);
      } else {
        // Create new helper route (only for helper routes, not regular routes)
        if (!transferDto.targetRouteId) {
          const newHelperRoute = manager.create(RouteList, {
            route: transferDto.targetRoute,
            number_of_stops: transferDto.numberOfStops,
            number_of_packages: transferDto.numberOfPackages,
            date: sourceRoute.date,
          });
          targetRoute = await manager.save(newHelperRoute);
        }
      }
    });

    return {
      sourceRoute,
      targetRoute,
    };
  }
}
