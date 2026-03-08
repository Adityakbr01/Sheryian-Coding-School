const router = require("express").Router();

const authRouter = require("./auth.router");
const postRouter = require("./post.router");
const userRouter = require("./user.router");

/**
 * @desc Root API Router
 * @desc This file combines all feature-based routers into a single entry point.
 * @desc It helps in managing all API routes from a central place.
 *
 * @baseRoute /api/v1
 */


/**
 * @desc Authentication Routes
 * @route /api/v1/auth
 * @access  Public / Private
 *
 * Handles all authentication related endpoints:
 * - Register user
 * - Login user
 * - Logout user
 * - Token validation
 */
router.use("/auth", authRouter);


/**
 * @desc Post Routes
 * @route /api/v1/post
 * @access Public / Private
 *
 * Handles all post related operations:
 * - Create post
 * - Update post
 * - Delete post
 * - Like / Unlike
 * - Comment on posts
 */
router.use("/post", postRouter);


/**
 * @desc User Routes
 * @route /api/v1/user
 * @access Public / Private
 *
 * Handles user related operations:
 * - Get user profile
 * - Update profile
 * - Follow / Unfollow users
 * - Get user posts
 */
router.use("/user", userRouter);


/**
 * @desc Export Root Router
 * @desc This router will be mounted in the main server file
 */
module.exports = router;