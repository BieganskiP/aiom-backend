import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockPayload = { sub: 'user-123', email: 'test@example.com' };
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      active: true,
      role: UserRole.USER,
    };

    it('should return user when valid payload is provided', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      const result = await strategy.validate(mockPayload);
      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      mockUsersService.findOne.mockResolvedValue({
        ...mockUser,
        active: false,
      });
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
