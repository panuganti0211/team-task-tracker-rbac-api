import { asyncHandler } from '../../utils/helpers.js';
import { AuthService } from '../../services/authService.js';
import { formatApiResponse } from '../../utils/helpers.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, organizationName } = req.body;

  const result = await AuthService.register(
    email,
    password,
    firstName,
    lastName,
    organizationName
  );

  res.status(201).json(
    formatApiResponse(
      201,
      'User registered successfully',
      result
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  res.status(200).json(
    formatApiResponse(
      200,
      'Login successful',
      result
    )
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await AuthService.refreshAccessToken(refreshToken);

  res.status(200).json(
    formatApiResponse(
      200,
      'Token refreshed successfully',
      result
    )
  );
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await AuthService.logout(userId);

  res.status(200).json(
    formatApiResponse(200, result.message)
  );
});
