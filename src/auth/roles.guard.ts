import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If user is OWNER, they have admin privileges but can't modify ADMIN accounts
    if (user.role === UserRole.OWNER) {
      const targetUserId = request.params.id;
      const method = request.method;
      const path = request.route.path;

      // If this is a user modification endpoint
      if (
        targetUserId &&
        ['PATCH', 'DELETE'].includes(method) &&
        path.includes('/users/')
      ) {
        // Get the target user from request body for role checks
        const targetUser = request.body;

        // Prevent OWNER from modifying ADMIN accounts
        if (targetUser.role === UserRole.ADMIN) {
          return false;
        }
      }

      // For all other cases, OWNER has the same privileges as ADMIN
      return requiredRoles.includes(UserRole.ADMIN);
    }

    return requiredRoles.includes(user.role);
  }
}
