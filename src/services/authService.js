import {
  generateTokens,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  hashRefreshToken,
  compareRefreshToken,
} from '../utils/jwt.js';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';
import { AuthRepository } from '../repositories/authRepository.js';
import { OrganizationRepository } from '../repositories/organizationRepository.js';
import { USER_ROLES } from '../utils/constants.js';
import prisma from '../config/prisma.js';

export class AuthService {
  static async register(email, password, firstName, lastName, organizationName) {
    // Check if user already exists
    const existingUser = await AuthRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create organization
    const organization = await OrganizationRepository.createOrganization({
      name: organizationName,
    });

    // Generate tokens with tokenId
    const refreshTokenRecord = await AuthRepository.storeRefreshToken(
      user.id,
      '', // Will be set with hash below
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    );

    const tokens = generateTokens(user.id, refreshTokenRecord.id);
    const hashedRefreshToken = await hashRefreshToken(tokens.refreshToken);
    
    // Update the stored refresh token with the hash
    await prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { hashedToken: hashedRefreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  static async login(email, password) {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Revoke prior refresh tokens to enforce single valid refresh token per user
    await AuthRepository.revokeAllUserTokens(user.id);

    // Generate tokens with tokenId
    const refreshTokenRecord = await AuthRepository.storeRefreshToken(
      user.id,
      '', // Will be set with hash below
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    );

    const tokens = generateTokens(user.id, refreshTokenRecord.id);
    const hashedRefreshToken = await hashRefreshToken(tokens.refreshToken);
    
    // Update the stored refresh token with the hash
    await prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { hashedToken: hashedRefreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  static async refreshAccessToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const tokenId = decoded.tokenId;
    if (!tokenId) {
      throw new AuthenticationError('Malformed refresh token');
    }

    const tokenRecord = await AuthRepository.findRefreshTokenById(tokenId);
    if (!tokenRecord) {
      throw new AuthenticationError('Refresh token not found or already revoked');
    }

    if (tokenRecord.revokedAt) {
      throw new AuthenticationError('Refresh token has been revoked');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new AuthenticationError('Refresh token has expired');
    }

    const isTokenValid = await compareRefreshToken(refreshToken, tokenRecord.hashedToken);
    if (!isTokenValid) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const user = await AuthRepository.findUserById(decoded.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Revoke old token to prevent reuse
    await AuthRepository.revokeRefreshToken(tokenId);

    // Generate new tokens
    const newRefreshTokenRecord = await AuthRepository.storeRefreshToken(
      user.id,
      '', // Will be set with hash below
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    );

    const newTokens = generateTokens(user.id, newRefreshTokenRecord.id);
    const hashedNewRefreshToken = await hashRefreshToken(newTokens.refreshToken);
    
    // Update the stored refresh token with the hash
    await prisma.refreshToken.update({
      where: { id: newRefreshTokenRecord.id },
      data: { hashedToken: hashedNewRefreshToken },
    });

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  static async logout(userId) {
    await AuthRepository.revokeAllUserTokens(userId);
    return { message: 'Logged out successfully' };
  }
}
