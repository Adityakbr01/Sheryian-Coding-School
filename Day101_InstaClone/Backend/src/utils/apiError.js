const STATUS_CODES = require("../constants/statusCodes");

class ApiError extends Error {
  constructor(statusCode=STATUS_CODES.INTERNAL_SERVER_ERROR, message = "Something went wrong") {
    super(message);
    this.status = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;