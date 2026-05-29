import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import config from '../config/index.js';

export const generateTokens = (userId, tokenId = null) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshTokenPayload = { userId };
  if (tokenId) {
    refreshTokenPayload.tokenId = tokenId;
  }

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password) => {
  return bcryptjs.hash(password, config.bcrypt.rounds);
};

export const comparePassword = async (password, hash) => {
  return bcryptjs.compare(password, hash);
};

export const hashRefreshToken = async (token) => {
  return bcryptjs.hash(token, config.bcrypt.rounds);
};

export const compareRefreshToken = async (token, hash) => {
  return bcryptjs.compare(token, hash);
};

export const parseJwt = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch (error) {
    return null;
  }
};

export const getTokenExpiry = (token) => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
};
