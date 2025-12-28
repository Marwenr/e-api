import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from './auth';
import { ForbiddenError } from '../services/errors';
import { UserRole } from '../models/types';

/**
 * Role-based access control middleware factory
 * Creates middleware that checks if user has required role(s)
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> => {
    if (!request.user) {
      throw new ForbiddenError('Authentication required');
    }

    const userRole = request.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      );
    }
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Require store owner or admin
 */
export const requireStoreOwner = requireRole(UserRole.STORE_OWNER, UserRole.ADMIN);

/**
 * Require store manager, store owner, or admin
 */
export const requireStoreManager = requireRole(
  UserRole.STORE_MANAGER,
  UserRole.STORE_OWNER,
  UserRole.ADMIN
);

/**
 * Require any authenticated user (customer or above)
 */
export const requireAnyAuth = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!request.user) {
    throw new ForbiddenError('Authentication required');
  }
};

/**
 * Check if user has at least one of the required roles
 */
export const hasRole = (userRole: string, ...allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole as UserRole);
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRole: string): boolean => {
  return userRole === UserRole.ADMIN;
};

/**
 * Check if user can manage store (store owner, manager, or admin)
 */
export const canManageStore = (userRole: string): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.STORE_OWNER,
    UserRole.STORE_MANAGER,
  ].includes(userRole as UserRole);
};

