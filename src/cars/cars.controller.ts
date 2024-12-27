import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { AssignCarDto } from './dto/assign-car.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdateCarStatusDto } from './dto/update-car-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createCarDto: CreateCarDto, @Request() req) {
    return this.carsService.create(createCarDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.carsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCarDto: UpdateCarDto,
    @Request() req,
  ) {
    return this.carsService.update(id, updateCarDto, req.user.id);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN)
  assign(
    @Param('id') id: string,
    @Body() assignCarDto: AssignCarDto,
    @Request() req,
  ) {
    return this.carsService.assign(id, assignCarDto, req.user.id);
  }

  @Post(':id/unassign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  unassign(@Param('id') id: string, @Request() req) {
    return this.carsService.unassign(id, req.user.id);
  }

  @Delete(':id/soft')
  @Roles(UserRole.ADMIN)
  async softDelete(@Param('id') id: string) {
    await this.carsService.softDelete(id);
    return { message: 'Car deactivated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async hardDelete(@Param('id') id: string) {
    await this.carsService.hardDelete(id);
    return { message: 'Car deleted successfully' };
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateCarStatusDto: UpdateCarStatusDto,
    @Request() req,
  ) {
    return this.carsService.updateStatus(id, updateCarStatusDto, req.user.id);
  }
}
