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
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AssignRouteDto } from './dto/assign-route.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createRouteDto: CreateRouteDto, @Request() req) {
    return this.routesService.create(createRouteDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto,
    @Request() req,
  ) {
    return this.routesService.update(id, updateRouteDto, req.user.id);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN)
  assign(
    @Param('id') id: string,
    @Body() assignRouteDto: AssignRouteDto,
    @Request() req,
  ) {
    return this.routesService.assign(id, assignRouteDto, req.user.id);
  }

  @Post(':id/unassign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  unassign(@Param('id') id: string, @Request() req) {
    return this.routesService.unassign(id, req.user.id);
  }

  @Delete(':id/soft')
  @Roles(UserRole.ADMIN)
  async softDelete(@Param('id') id: string) {
    await this.routesService.softDelete(id);
    return { message: 'Route deactivated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async hardDelete(@Param('id') id: string) {
    await this.routesService.hardDelete(id);
    return { message: 'Route deleted successfully' };
  }
}
