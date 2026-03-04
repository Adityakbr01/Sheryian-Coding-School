const router = require("express").Router();

const authRouter = require("./auth.router");

/**
 * @route  /api/v1/auth
 */
router.use("/auth", authRouter);

module.exports = router;