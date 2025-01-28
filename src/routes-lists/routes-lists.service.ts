import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteList } from './entities/route-list.entity';

@Injectable()
export class RoutesListsService {
  constructor(
    @InjectRepository(RouteList)
    private routeListRepository: Repository<RouteList>,
  ) {}

  findAll() {
    return this.routeListRepository.find();
  }

  findOne(id: number) {
    return this.routeListRepository.findOne({ where: { id } });
  }
} 