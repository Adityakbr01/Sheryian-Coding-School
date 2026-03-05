const postController = require("../controllers/post.controller");
const upload = require("../middlewares/multer");

const router = require("express").Router();

/**
 * @route   POST /api/v1/post
 * @desc    Create a new post
 * @access  Authenticated
 */
router.post("/",upload.single("postImage"), postController.createPost);


module.exports = router;
