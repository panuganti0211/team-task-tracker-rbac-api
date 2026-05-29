import { verifyAccessToken } from '../utils/jwt.js';
import { AuthenticationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/helpers.js';
import prisma from '../config/prisma.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AuthenticationError('No authorization token provided');
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    throw new AuthenticationError('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { organization: true },
  });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  req.user = user;
  req.userId = user.id;
  req.organizationId = user.organizationId;

  next();
});

export const optional = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { organization: true },
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
        req.organizationId = user.organizationId;
      }
    }
  }

  next();
});
