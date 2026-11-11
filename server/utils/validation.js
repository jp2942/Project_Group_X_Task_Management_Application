// Build an Error object with an HTTP status code
const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Parse and verify a positive integer ID parameter
const parsePositiveInt = (value) => {
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) return null;
  const num = Number(str);
  return num > 0 ? num : null;
};

module.exports = {
  createHttpError,
  parsePositiveInt,
};
