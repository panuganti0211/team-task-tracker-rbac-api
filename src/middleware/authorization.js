import { AuthorizationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * RBAC middleware - checks if user has required roles
 * Must be used after authenticate middleware
 * 
 * Usage: authorize(['ADMIN', 'MANAGER'])
 */
export const authorize = (allowedRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  });
};

/**
 * Check if user belongs to the organization
 */
export const organizationAccess = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.organizationId) {
    throw new AuthorizationError('User not authenticated');
  }

  if (req.user.organizationId !== req.organizationId) {
    throw new AuthorizationError(
      'You do not have access to this organization'
    );
  }

  next();
});

/**
 * Middleware to ensure org_id in request matches user's org
 */
export const validateOrgAccess = asyncHandler(async (req, res, next) => {
  const orgId = req.query.org_id || req.body.org_id || req.params.org_id;

  if (orgId && orgId !== req.user.organizationId) {
    throw new AuthorizationError(
      'You do not have access to this organization'
    );
  }

  next();
});
