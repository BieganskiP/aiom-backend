import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AssignRouteDto } from './dto/assign-route.dto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async create(createRouteDto: CreateRouteDto, userId: string): Promise<Route> {
    const route = this.routesRepository.create({
      ...createRouteDto,
      updatedBy: userId,
    });
    return this.routesRepository.save(route);
  }

  async findAll(): Promise<Route[]> {
    return this.routesRepository.find({
      relations: ['assignedUser', 'updatedByUser'],
    });
  }

  async findOne(id: string): Promise<Route> {
    const route = await this.routesRepository.findOne({
      where: { id },
      relations: ['assignedUser', 'updatedByUser'],
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async update(
    id: string,
    updateRouteDto: UpdateRouteDto,
    userId: string,
  ): Promise<Route> {
    const route = await this.findOne(id);
    Object.assign(route, {
      ...updateRouteDto,
      updatedBy: userId,
    });
    return this.routesRepository.save(route);
  }

  async assign(id: string, assignRouteDto: AssignRouteDto, userId: string) {
    // Load the route with relations before making changes
    const route = await this.routesRepository.findOne({
      where: { id },
      relations: ['assignedUser', 'updatedByUser'],
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }

    // If there was a previously assigned user, clear their routeId
    if (route.assignedUserId) {
      const previousUser = await this.usersService.findOne(
        route.assignedUserId,
      );
      if (previousUser) {
        await this.usersService.update(previousUser.id, { routeId: null });
      }
    }

    // Handle explicit unassignment (when assignedUserId is null)
    if (assignRouteDto.assignedUserId === null) {
      route.assignedUserId = null;
      route.updatedBy = userId;
      await this.routesRepository.save(route);
      return this.findOne(id);
    }

    // Update the route first
    Object.assign(route, {
      assignedUserId: assignRouteDto.assignedUserId || null,
      updatedBy: userId,
    });
    await this.routesRepository.save(route);

    // If assigning to a new user
    if (assignRouteDto.assignedUserId) {
      const newUser = await this.usersService.findOne(
        assignRouteDto.assignedUserId,
      );
      if (!newUser) {
        throw new BadRequestException('User not found');
      }
      // Update the user's routeId
      await this.usersService.update(newUser.id, { routeId: id });
    }

    return this.findOne(id); // Return fresh data with relations
  }

  async softDelete(id: string): Promise<void> {
    const route = await this.findOne(id);
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    await this.routesRepository.update(id, { active: false });
  }

  async hardDelete(id: string): Promise<void> {
    const route = await this.findOne(id);
    if (!route) {
      throw new NotFoundException('Route not found');
    }

    await this.routesRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // First, unassign any users from this route
        await transactionalEntityManager
          .createQueryBuilder()
          .update('users')
          .set({ routeId: null })
          .where('routeId = :routeId', { routeId: id })
          .execute();

        // Then delete the route
        await transactionalEntityManager.delete(Route, id);
      },
    );
  }

  async unassign(id: string, userId: string) {
    await this.routesRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // First, get the route with relations
        const route = await transactionalEntityManager.findOne(Route, {
          where: { id },
          relations: ['assignedUser'],
        });

        if (!route) {
          throw new NotFoundException('Route not found');
        }

        // If there's an assigned user, update their routeId to null
        if (route.assignedUserId) {
          await transactionalEntityManager
            .createQueryBuilder()
            .update('users')
            .set({ routeId: null })
            .where('id = :userId', { userId: route.assignedUserId })
            .execute();
        }

        // Update the route
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Route)
          .set({ assignedUserId: null, updatedBy: userId })
          .where('id = :id', { id })
          .execute();
      },
    );

    return this.findOne(id);
  }
}
