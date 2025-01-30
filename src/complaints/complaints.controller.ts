import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { FindComplaintsDto } from './dto/find-complaints.dto';
import { BulkAssignUserDto } from './dto/bulk-assign-user.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { GetStatsDto } from './dto/get-stats.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { BulkUpdateResult, ComplaintStats } from './types/complaint.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  async createMany(@Body() createComplaintDtos: CreateComplaintDto[]) {
    const result = await this.complaintsService.createMany(createComplaintDtos);
    return {
      message: `Reklamacje dodane pomyślnie. Dodane: ${result.totalCreated}, Pominięte: ${result.totalSkipped}`,
      created: result.created,
      skipped: result.skipped,
      totalProcessed: result.totalProcessed,
      totalCreated: result.totalCreated,
      totalSkipped: result.totalSkipped,
    };
  }

  @Post('bulk-assign')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  bulkAssignUser(
    @Body() bulkAssignUserDto: BulkAssignUserDto,
  ): Promise<BulkUpdateResult> {
    return this.complaintsService.bulkAssignUser(
      bulkAssignUserDto.complaintIds,
      bulkAssignUserDto.userId,
    );
  }

  @Post('bulk-status')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  bulkUpdateStatus(
    @Body() bulkUpdateStatusDto: BulkUpdateStatusDto,
  ): Promise<BulkUpdateResult> {
    return this.complaintsService.bulkUpdateStatus(
      bulkUpdateStatusDto.complaintIds,
      bulkUpdateStatusDto.status,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.LEADER)
  findAll(@Query() findComplaintsDto: FindComplaintsDto) {
    return this.complaintsService.findAll(findComplaintsDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.LEADER)
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(+id);
  }

  @Patch(':id/assign/:userId')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  assignUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.complaintsService.assignUser(+id, userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateStatus(+id, updateStatusDto.status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(+id);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.LEADER)
  getStats(@Query() getStatsDto: GetStatsDto): Promise<ComplaintStats> {
    return this.complaintsService.getStats(getStatsDto);
  }
}
