/**
 * asyncHandler
 * -----------------------------------------------------
 * Utility wrapper to handle async errors in Express routes.
 * Automatically forwards rejected promises to the global
 * Express error handling middleware.
 *
 * This prevents the need to write try/catch blocks
 * in every controller function.
 *
 * Example Usage:
 *
 * @example
 * const asyncHandler = require("../utils/asyncHandler");
 *
 * router.post(
 *   "/register",
 *   asyncHandler(authController.registerUser)
 * );
 *
 *
 * -----------------------------------------------------
 * Example Route Documentation
 * -----------------------------------------------------
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 *
 * @body
 *  - userName {String} Required
 *  - email    {String} Required
 *  - password {String} Required
 */

const asyncHandler = (handler) => {
  return function asyncUtilWrap(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;