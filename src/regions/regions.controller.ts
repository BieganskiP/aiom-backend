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
  NotFoundException,
} from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionsService.create(createRegionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  findAll() {
    return this.regionsService.findAll();
  }

  @Get('my-regions')
  @Roles(UserRole.LEADER)
  findMyRegions(@Request() req) {
    return this.regionsService.findByLeader(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.LEADER)
  findOne(@Param('id') id: string, @Request() req) {
    // If user is a leader, verify they have access to this region
    if (req.user.role === UserRole.LEADER) {
      // This will throw NotFoundException if region doesn't exist or user doesn't have access
      return this.regionsService.findByLeader(req.user.id).then((regions) => {
        const region = regions.find((r) => r.id === id);
        if (!region) {
          throw new NotFoundException('Region not found or access denied');
        }
        return region;
      });
    }
    return this.regionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    return this.regionsService.update(id, updateRegionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.regionsService.remove(id);
  }

  @Post(':id/routes')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async addRoutes(
    @Param('id') id: string,
    @Body() body: { routeIds: string[] },
  ) {
    return this.regionsService.addRoutes(id, body.routeIds);
  }

  @Delete(':id/routes/:routeId')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async removeRoute(
    @Param('id') id: string,
    @Param('routeId') routeId: string,
  ) {
    return this.regionsService.removeRoute(id, routeId);
  }

  @Get(':id/routes')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.LEADER)
  async getRoutes(@Param('id') id: string, @Request() req) {
    if (req.user.role === UserRole.LEADER) {
      const regions = await this.regionsService.findByLeader(req.user.id);
      const region = regions.find((r) => r.id === id);
      if (!region) {
        throw new NotFoundException('Region not found or access denied');
      }
    }
    return this.regionsService.getRoutes(id);
  }
}
