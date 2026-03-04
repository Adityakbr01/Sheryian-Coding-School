/**
 * =========================================
 * API RESPONSE UTILITY
 * =========================================
 * @description Standardized API response handler
 */

const STATUS_CODES = require("../constants/statusCodes");

class ApiResponse {
  constructor({
    success = true,
    message = "Success",
    status = STATUS_CODES.OK,
    data = null,
    meta = null,
  }) {
    this.success = success;
    this.message = message;
    this.status = status;
    this.data = data;
    if (meta) this.meta = meta;
  }

  static success(
    res,
    { status = 200, message = "Success", data = null, meta = null },
  ) {
    return res.status(status).json(
      new ApiResponse({
        success: true,
        message,
        status,
        data,
        meta,
      }),
    );
  }

  static error(
    res,
    { status = 500, message = "Internal Server Error", error = null },
  ) {
    return res.status(status).json({
      success: false,
      status,
      message,
      error,
    });
  }
}

module.exports = ApiResponse;
