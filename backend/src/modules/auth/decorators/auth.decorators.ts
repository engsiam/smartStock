import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BusinessRole } from '@prisma/client';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: BusinessRole[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

export const CurrentBusiness = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // 1. Check custom header x-business-id
    const headerBiz = request.headers['x-business-id'];
    if (typeof headerBiz === 'string' && headerBiz.trim().length > 0) {
      return headerBiz.trim();
    }
    // 2. Fall back to user's first business membership
    const user = request.user;
    if (user && user.memberships && user.memberships.length > 0) {
      return user.memberships[0].businessId;
    }
    return '';
  },
);
