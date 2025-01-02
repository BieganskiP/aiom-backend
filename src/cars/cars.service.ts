import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { AssignCarDto } from './dto/assign-car.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UpdateCarStatusDto } from './dto/update-car-status.dto';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    private usersService: UsersService,
  ) {}

  async create(createCarDto: CreateCarDto, userId: string): Promise<Car> {
    const car = this.carsRepository.create({
      ...createCarDto,
      updatedBy: userId,
    });
    return this.carsRepository.save(car);
  }

  async findAll(): Promise<Car[]> {
    return this.carsRepository.find({
      relations: ['assignedUser', 'updatedByUser'],
    });
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carsRepository.findOne({
      where: { id },
      relations: ['assignedUser', 'updatedByUser'],
    });
    if (!car) {
      throw new NotFoundException('Car not found');
    }
    return car;
  }

  async update(
    id: string,
    updateCarDto: UpdateCarDto,
    userId: string,
  ): Promise<Car> {
    const car = await this.findOne(id);

    // Clean up date fields
    const cleanedDto = {
      ...updateCarDto,
      checkupDate:
        updateCarDto.checkupDate === '' ? null : updateCarDto.checkupDate,
      oilChangeDate:
        updateCarDto.oilChangeDate === '' ? null : updateCarDto.oilChangeDate,
      tiresChangeDate:
        updateCarDto.tiresChangeDate === ''
          ? null
          : updateCarDto.tiresChangeDate,
      brakesChangeDate:
        updateCarDto.brakesChangeDate === ''
          ? null
          : updateCarDto.brakesChangeDate,
    };

    Object.assign(car, {
      ...cleanedDto,
      updatedBy: userId,
    });

    return this.carsRepository.save(car);
  }

  async assign(id: string, assignCarDto: AssignCarDto, userId: string) {
    // Load the car with relations before making changes
    const car = await this.carsRepository.findOne({
      where: { id },
      relations: ['assignedUser', 'updatedByUser'],
    });
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    // If there was a previously assigned user, clear their carId
    if (car.assignedUserId) {
      const previousUser = await this.usersService.findOne(car.assignedUserId);
      if (previousUser) {
        await this.usersService.update(previousUser.id, { carId: null });
      }
    }

    // Handle explicit unassignment (when assignedUserId is null)
    if (assignCarDto.assignedUserId === null) {
      await this.carsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // First update the user's carId to null if there is an assigned user
          if (car.assignedUserId) {
            await transactionalEntityManager
              .createQueryBuilder()
              .update(User)
              .set({ carId: null })
              .where('id = :userId', { userId: car.assignedUserId })
              .execute();
          }

          // Then update the car
          await transactionalEntityManager
            .createQueryBuilder()
            .update(Car)
            .set({ assignedUserId: null, updatedBy: userId })
            .where('id = :id', { id })
            .execute();
        },
      );
      return this.findOne(id);
    }

    // Update the car first
    Object.assign(car, {
      assignedUserId: assignCarDto.assignedUserId || null,
      updatedBy: userId,
    });
    await this.carsRepository.save(car);

    // If assigning to a new user
    if (assignCarDto.assignedUserId) {
      const newUser = await this.usersService.findOne(
        assignCarDto.assignedUserId,
      );
      if (!newUser) {
        throw new BadRequestException('User not found');
      }
      // Update the user's carId
      await this.usersService.update(newUser.id, { carId: id });
    }

    return this.findOne(id); // Return fresh data with relations
  }

  async softDelete(id: string): Promise<void> {
    const car = await this.findOne(id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }
    await this.carsRepository.update(id, { active: false });
  }

  async hardDelete(id: string): Promise<void> {
    const car = await this.findOne(id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    await this.carsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // First, unassign any users from this car
        await transactionalEntityManager
          .createQueryBuilder()
          .update('users')
          .set({ carId: null })
          .where('carId = :carId', { carId: id })
          .execute();

        // Then delete the car
        await transactionalEntityManager.delete(Car, id);
      },
    );
  }

  async unassign(id: string, userId: string) {
    await this.carsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const car = await transactionalEntityManager.findOne(Car, {
          where: { id },
          relations: ['assignedUser'],
        });

        if (!car) {
          throw new NotFoundException('Car not found');
        }

        // If there's an assigned user, update their carId to null
        if (car.assignedUserId) {
          // First update car to remove the foreign key constraint
          await transactionalEntityManager
            .createQueryBuilder()
            .update(Car)
            .set({ assignedUserId: null, updatedBy: userId })
            .where('id = :id', { id })
            .execute();

          // Then update the user
          await transactionalEntityManager
            .createQueryBuilder()
            .update(User)
            .set({ carId: null })
            .where('id = :userId', { userId: car.assignedUserId })
            .execute();
        }
      },
    );

    return this.findOne(id);
  }

  async updateStatus(
    id: string,
    updateCarStatusDto: UpdateCarStatusDto,
    userId: string,
  ): Promise<Car> {
    const car = await this.findOne(id);
    car.status = updateCarStatusDto.status;
    car.updatedBy = userId;
    return this.carsRepository.save(car);
  }
}
