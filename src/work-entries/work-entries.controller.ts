import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkEntriesService } from './work-entries.service';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { UpdateWorkEntryDto } from './dto/update-work-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Type } from 'class-transformer';
import { IsOptional, IsDate, IsString } from 'class-validator';

class GetWorkEntriesQueryDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  month?: Date;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  routeId?: string;

  @IsOptional()
  @IsString()
  carId?: string;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

@UseGuards(JwtAuthGuard)
@Controller('work-entries')
export class WorkEntriesController {
  constructor(private readonly workEntriesService: WorkEntriesService) {}

  @Post()
  create(@Body() createWorkEntryDto: CreateWorkEntryDto, @Request() req) {
    return this.workEntriesService.create(req.user.id, createWorkEntryDto);
  }

  @Get('my-entries')
  findMyEntries(@Query() query: GetWorkEntriesQueryDto, @Request() req) {
    return this.workEntriesService.findAllForUser(req.user.id, query.month);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.LEADER)
  @UseGuards(RolesGuard)
  findAll(@Query() query: GetWorkEntriesQueryDto, @Request() req) {
    return this.workEntriesService.findAll(query, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkEntryDto: UpdateWorkEntryDto,
    @Request() req,
  ) {
    return this.workEntriesService.update(id, req.user.id, updateWorkEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.workEntriesService.remove(id, req.user.id);
  }

  @Get('financial-summary')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.LEADER)
  @UseGuards(RolesGuard)
  getFinancialSummary(@Query() query: GetWorkEntriesQueryDto, @Request() req) {
    return this.workEntriesService.getFinancialSummary(query, req.user);
  }
}
