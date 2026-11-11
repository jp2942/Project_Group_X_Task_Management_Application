// Handle requests made to non-existent endpoints
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Map PostgreSQL constraint and syntax error codes to HTTP responses
const mapDatabaseError = (err) => {
  switch (err.code) {
    case '23503':
      return {
        statusCode: 400,
        message: 'Invalid reference: Referenced user does not exist or still has assigned tasks.',
      };
    case '23505':
      return { statusCode: 409, message: 'A record with this unique field already exists.' };
    case '23514':
      return { statusCode: 400, message: 'Validation error: One or more fields violate constraint rules.' };
    case '23502':
      return { statusCode: 400, message: 'Missing required database field.' };
    case '22001':
      return { statusCode: 400, message: 'Input value exceeds maximum allowed column length.' };
    case '22P02':
      return { statusCode: 400, message: 'Invalid parameter format: Expected a valid data type.' };
    default:
      return null;
  }
};

// Centralized error handling middleware for formatting API errors
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle malformed JSON request bodies from express.json()
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body.';
  }

  // Override status and message for known PostgreSQL errors
  const dbError = mapDatabaseError(err);
  if (dbError) {
    statusCode = dbError.statusCode;
    message = dbError.message;
  }

  if (statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.url}:`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = { notFoundHandler, errorHandler };
