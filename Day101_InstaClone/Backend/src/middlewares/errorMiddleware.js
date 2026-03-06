const ApiResponse = require("../utils/apiResponse");
const errorCodesGLOBAL = require("../constants/errorCodesGLOBAL");
const multer = require("multer");

function globalErrorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  /**
   * =========================================
   * MULTER ERRORS
   * =========================================
   */

  if (err instanceof multer.MulterError) {
    const multerError = errorCodesGLOBAL.MULTER[err.code];

    if (multerError) {
      statusCode = multerError.status;
      message = multerError.message;
    }
  }

  /**
   * =========================================
   * JWT ERRORS
   * =========================================
   */

  if (errorCodesGLOBAL.JWT[err.name]) {
    statusCode = errorCodesGLOBAL.JWT[err.name].status;
    message = errorCodesGLOBAL.JWT[err.name].message;
  }

  /**
   * =========================================
   * MONGODB DUPLICATE KEY
   * =========================================
   */

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    statusCode = errorCodesGLOBAL.MONGODB.DUPLICATE_KEY.status;
    message = `${field} already exists`;
  }

  /**
   * =========================================
   * MONGOOSE ERRORS
   * =========================================
   */

  if (errorCodesGLOBAL.MONGOOSE[err.name]) {
    statusCode = errorCodesGLOBAL.MONGOOSE[err.name].status;

    if (err.name === "ValidationError") {
      message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
    } else {
      message = errorCodesGLOBAL.MONGOOSE[err.name].message;
    }
  }

  return ApiResponse.error(res, {
    status: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
}

module.exports = globalErrorHandler;
