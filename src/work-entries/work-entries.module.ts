import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkEntriesService } from './work-entries.service';
import { WorkEntriesController } from './work-entries.controller';
import { WorkEntry } from './entities/work-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkEntry])],
  controllers: [WorkEntriesController],
  providers: [WorkEntriesService],
})
export class WorkEntriesModule {}
