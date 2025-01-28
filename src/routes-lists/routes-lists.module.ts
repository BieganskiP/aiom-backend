import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesListsService } from './routes-lists.service';
import { RoutesListsController } from './routes-lists.controller';
import { RouteList } from './entities/route-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RouteList])],
  controllers: [RoutesListsController],
  providers: [RoutesListsService],
})
export class RoutesListsModule {} 