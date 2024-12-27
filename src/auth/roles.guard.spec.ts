import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: UserRole.USER,
            },
          }),
        }),
      } as unknown as ExecutionContext;
    });

    it('should return true when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should return true when user has required role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.USER]);
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);
      expect(guard.canActivate(mockContext)).toBe(false);
    });
  });
});
