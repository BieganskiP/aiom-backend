import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne('123');
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '123' });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = new User();
      mockUser.email = 'test@example.com';
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });
});
