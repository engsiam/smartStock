import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/auth.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<BusinessRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = ctxGetRequest(context);
    const user = request.user;
    if (!user || !user.memberships) {
      throw new ForbiddenException('User session does not have tenancy context');
    }

    const activeBizId =
      request.headers['x-business-id'] ||
      (user.memberships.length > 0 ? user.memberships[0].businessId : null);

    if (!activeBizId) {
      throw new ForbiddenException('No active business selected');
    }

    const membership = user.memberships.find(
      (m: { businessId: string; role: BusinessRole }) => m.businessId === activeBizId,
    );

    if (!membership) {
      throw new ForbiddenException('User is not a member of the requested business');
    }

    const hasRole = requiredRoles.includes(membership.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Action requires one of the following roles: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}

function ctxGetRequest(context: ExecutionContext) {
  return context.switchToHttp().getRequest();
}
