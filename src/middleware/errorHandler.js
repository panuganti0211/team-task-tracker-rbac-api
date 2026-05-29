import { formatApiResponse } from '../utils/helpers.js';
import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ...formatApiResponse(err.statusCode, err.message, null),
      code: err.code,
    });
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    const message = err.details?.[0]?.message || 'Validation error';
    return res.status(400).json({
      ...formatApiResponse(400, message, null),
      code: 'VALIDATION_ERROR',
    });
  }

  // Handle unexpected errors
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  const response = formatApiResponse(statusCode, message, null);
  if (err.code) {
    response.code = err.code;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json(
    formatApiResponse(404, 'Endpoint not found', null)
  );
};
