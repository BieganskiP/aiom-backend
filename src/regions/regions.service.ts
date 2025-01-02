import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Region } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Route } from '../routes/entities/route.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    const region = this.regionsRepository.create(createRegionDto);
    return this.regionsRepository.save(region);
  }

  async findAll(): Promise<Region[]> {
    return this.regionsRepository.find({
      relations: ['leader', 'routes'],
    });
  }

  async findOne(id: string): Promise<Region> {
    const region = await this.regionsRepository.findOne({
      where: { id },
      relations: ['leader', 'routes'],
    });
    if (!region) {
      throw new NotFoundException('Region not found');
    }
    return region;
  }

  async findByLeader(leaderId: string): Promise<Region[]> {
    return this.regionsRepository.find({
      where: { leaderId },
      relations: ['leader', 'routes'],
    });
  }

  async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
    const region = await this.findOne(id);
    Object.assign(region, updateRegionDto);
    return this.regionsRepository.save(region);
  }

  async remove(id: string): Promise<void> {
    const region = await this.findOne(id);
    await this.regionsRepository.remove(region);
  }

  async addRoutes(regionId: string, routeIds: string[]): Promise<Region> {
    const region = await this.findOne(regionId);
    const routes = await this.routesRepository.findByIds(routeIds);

    if (routes.length !== routeIds.length) {
      throw new NotFoundException('One or more routes not found');
    }

    // Update each route with the new region
    await Promise.all(
      routes.map((route) =>
        this.routesRepository.update(route.id, { regionId: region.id }),
      ),
    );

    return this.findOne(regionId);
  }

  async removeRoute(regionId: string, routeId: string): Promise<void> {
    const region = await this.findOne(regionId);
    const route = await this.routesRepository.findOne({
      where: { id: routeId, regionId: region.id },
    });

    if (!route) {
      throw new NotFoundException('Route not found in this region');
    }

    await this.routesRepository.update(routeId, { regionId: null });
  }

  async getRoutes(regionId: string): Promise<Route[]> {
    const region = await this.findOne(regionId);
    return this.routesRepository.find({
      where: { regionId: region.id },
      relations: ['assignedUser'],
    });
  }

  async assignLeader(regionId: string, leaderId: string): Promise<Region> {
    const region = await this.findOne(regionId);
    const leader = await this.usersRepository.findOne({
      where: { id: leaderId },
    });

    if (!leader) {
      throw new NotFoundException('User not found');
    }

    if (leader.role !== UserRole.LEADER) {
      // Update user role to leader
      await this.usersRepository.update(leaderId, { role: UserRole.LEADER });
    }

    region.leaderId = leaderId;
    return this.regionsRepository.save(region);
  }

  async removeLeader(regionId: string): Promise<Region> {
    const region = await this.findOne(regionId);

    if (!region.leaderId) {
      throw new BadRequestException('Region does not have a leader');
    }

    const oldLeaderId = region.leaderId;

    // Check if the leader has other regions
    const otherRegions = await this.regionsRepository.count({
      where: { leaderId: oldLeaderId, id: Not(region.id) },
    });

    // If this is the leader's only region, revert their role to USER
    if (otherRegions === 0) {
      await this.usersRepository.update(oldLeaderId, {
        role: UserRole.USER,
      });
    }

    // Clear the leader and save
    region.leaderId = null;
    region.leader = null;
    await this.regionsRepository.save(region);

    // Fetch fresh data with updated relations
    return this.findOne(regionId);
  }
}
