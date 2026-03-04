const authController = require("../controllers/auth.controller");

const router = require("express").Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and return jwt Token
 * @access  Public
 */
router.post("/register", authController.registerUser);
/**
 * @route   POST /api/auth/login
 * @desc    Login a User and return jwt Token
 * @access  Public
 */
router.post("/login", authController.loginUser);

module.exports = router;
