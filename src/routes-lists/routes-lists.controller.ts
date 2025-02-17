import { Controller, Get, Param, Patch, Body, Query } from '@nestjs/common';
import { RoutesListsService } from './routes-lists.service';

@Controller('routes-lists')
export class RoutesListsController {
  constructor(private readonly routesListsService: RoutesListsService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('route') route?: string,
    @Query('period') period?: 'first' | 'second',
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const filters: any = {};

    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    if (route) {
      filters.route = route;
    }
    if (period && month && year) {
      filters.period = period;
      filters.month = parseInt(month, 10) - 1; // Convert to 0-based month
      filters.year = parseInt(year, 10);
    }

    return this.routesListsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesListsService.findOne(+id);
  }

  @Patch(':id/transfer')
  transfer(
    @Param('id') sourceId: string,
    @Body()
    transferDto: {
      targetRoute: string;
      targetRouteId?: number;
      numberOfStops: number;
      numberOfPackages: number;
    },
  ) {
    return this.routesListsService.transfer(+sourceId, transferDto);
  }
}
