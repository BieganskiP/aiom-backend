import { User, UserRole } from './user.entity';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User();
    expect(user).toBeTruthy();
  });

  it('should have default role as USER', () => {
    const user = new User();
    expect(user.role).toBe(UserRole.USER);
  });

  it('should have default active status as true', () => {
    const user = new User();
    expect(user.active).toBe(true);
  });
});
