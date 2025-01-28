import { Controller, Get, Param } from '@nestjs/common';
import { RoutesListsService } from './routes-lists.service';

@Controller('routes-lists')
export class RoutesListsController {
  constructor(private readonly routesListsService: RoutesListsService) {}

  @Get()
  findAll() {
    return this.routesListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesListsService.findOne(+id);
  }
} 