import prisma from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';

export class AuthRepository {
  static async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
  }

  static async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
  }

  static async createUser(data) {
    return prisma.user.create({
      data,
      include: { organization: true },
    });
  }

  static async storeRefreshToken(userId, hashedToken, expiresAt) {
    return prisma.refreshToken.create({
      data: {
        userId,
        hashedToken,
        expiresAt,
      },
    });
  }

  static async findValidRefreshToken(userId, tokenId) {
    return prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });
  }

  static async revokeRefreshToken(tokenId) {
    return prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  static async revokeAllUserTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  static async findRefreshTokenById(tokenId) {
    return prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });
  }

  static async findRefreshTokenByUserId(userId) {
    return prisma.refreshToken.findFirst({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
