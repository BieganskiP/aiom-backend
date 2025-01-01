import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: ['car', 'route'],
    });

    // Clear car relation if carId is null
    users.forEach((user) => {
      if (!user.carId) {
        user.car = null;
      }
      if (!user.routeId) {
        user.route = null;
      }
    });

    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['car', 'route'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Clear car relation if carId is null
    if (!user.carId) {
      user.car = null;
    }
    if (!user.routeId) {
      user.route = null;
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['car', 'route'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // First, unassign car and route from user
        if (user.carId || user.routeId) {
          await transactionalEntityManager.update(User, id, {
            carId: null,
            routeId: null,
          });
        }

        // Update any routes where this user is assigned or is the updatedBy
        await transactionalEntityManager
          .createQueryBuilder()
          .update('routes')
          .set({
            assignedUserId: null,
            updatedBy: null,
          })
          .where('assignedUserId = :userId OR updatedBy = :userId', {
            userId: id,
          })
          .execute();

        // Update any cars where this user is assigned or is the updatedBy
        await transactionalEntityManager
          .createQueryBuilder()
          .update('cars')
          .set({
            assignedUserId: null,
            updatedBy: null,
          })
          .where('assignedUserId = :userId OR updatedBy = :userId', {
            userId: id,
          })
          .execute();

        // Delete the user
        await transactionalEntityManager.delete(User, id);
      },
    );
  }

  async makeAdmin(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.ADMIN;
    return this.usersRepository.save(user);
  }

  async toggleActive(id: string, active: boolean): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.active = active;
    return this.usersRepository.save(user);
  }

  async storeInvitationToken(email: string, token: string, expiresAt: Date) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      throw new BadRequestException('Email already registered');
    }

    // Create a temporary user record with invitation token
    const tempUser = this.usersRepository.create({
      email,
      invitationToken: token,
      invitationExpires: expiresAt,
      // Set temporary values that will be updated during registration
      password: 'temporary',
      firstName: '',
      lastName: '',
      city: '',
      postCode: '',
      street: '',
      houseNumber: '',
      phoneNumber: '',
    });

    return this.usersRepository.save(tempUser);
  }

  async findInvitationByToken(token: string) {
    const user = await this.usersRepository.findOne({
      where: { invitationToken: token },
    });

    if (
      !user ||
      !user.invitationExpires ||
      user.invitationExpires < new Date()
    ) {
      return null;
    }

    return {
      email: user.email,
      expiresAt: user.invitationExpires,
    };
  }

  async findByPasswordResetToken(token: string) {
    return this.usersRepository.findOne({
      where: { passwordResetToken: token },
    });
  }

  async clearCache() {
    await this.usersRepository.clear();
  }

  async updatePaidPerStop(id: string, paidPerStop: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.paidPerStop = paidPerStop;
    return this.usersRepository.save(user);
  }
}
