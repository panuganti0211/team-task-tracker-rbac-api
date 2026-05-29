export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const sanitizeObject = (obj, fieldsToRemove = ['password']) => {
  const sanitized = { ...obj };
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  return sanitized;
};

export const buildCacheKey = (prefix, ...args) => {
  return [prefix, ...args].filter(Boolean).join(':');
};

export const calculatePagination = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const formatApiResponse = (statusCode, message, data = null, pagination = null) => {
  const response = {
    status: statusCode,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

export const getOffset = (page, limit) => {
  return (page - 1) * limit;
};
