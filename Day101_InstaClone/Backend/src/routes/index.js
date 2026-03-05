const router = require("express").Router();

const authRouter = require("./auth.router");
const postRouter = require("./post.router")

/**
 * @route  /api/v1/auth
 */
router.use("/auth", authRouter);
router.use("/post",postRouter)

module.exports = router;