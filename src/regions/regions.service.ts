import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
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
}
