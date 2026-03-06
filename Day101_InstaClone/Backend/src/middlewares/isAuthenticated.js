const jwt = require("jsonwebtoken");
const ENV = require("../configs/env");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const authHeaderToken = authHeader && authHeader.split(" ")[1];

    const token = req.cookies.token || authHeaderToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    ApiResponse.error(res, {
      status: error.status || 401,
      message: error.message,
    });
  }
}

module.exports = isAuthenticated;