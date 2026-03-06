const postController = require("../controllers/post.controller");
const upload = require("../middlewares/multer");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = require("express").Router();

// ─────────────────────────────────────────────
//  PUBLIC ROUTES  (no auth required)
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/post
 * @desc    Fetch all posts (latest first) with pagination
 * @access  Public
 * @query   page, limit
 */
router.get("/", postController.getAllPosts);

/**
 * @route   GET /api/v1/post/:postId
 * @desc    Fetch details of a single post
 * @access  Public
 * @param   postId - MongoDB ObjectId of the post
 */
router.get("/:postId", postController.getPostById);

// ─────────────────────────────────────────────
//  PROTECTED ROUTES  (auth required below)
// ─────────────────────────────────────────────

router.use(isAuthenticated);

/**
 * @route   POST /api/v1/post
 * @desc    Create a new post
 * @access  Authenticated
 * @body    caption {String} required
 * @body    postImage {File} optional (multipart/form-data)
 */
router.post("/", upload.single("postImage"), postController.createPost);

/**
 * @route   GET /api/v1/post/my/posts
 * @desc    Fetch all posts created by the logged-in user
 * @access  Authenticated
 * @query   page, limit
 */
router.get("/my/posts", postController.getMyPosts);

/**
 * @route   PUT /api/v1/post/:postId
 * @desc    Update caption/image of an existing post (owner only)
 * @access  Authenticated
 * @param   postId - MongoDB ObjectId of the post
 * @body    caption {String} optional
 * @body    postImage {File} optional (multipart/form-data)
 */
router.put("/:postId", upload.single("postImage"), postController.updatePost);

/**
 * @route   DELETE /api/v1/post/:postId
 * @desc    Permanently delete a post (owner only)
 * @access  Authenticated
 * @param   postId - MongoDB ObjectId of the post
 */
router.delete("/:postId", postController.deletePost);

/**
 * @route   POST /api/v1/post/:postId/like
 * @desc    Toggle like on a post (like if not liked, unlike if already liked)
 * @access  Authenticated
 * @param   postId - MongoDB ObjectId of the post
 */
router.post("/:postId/like", postController.toggleLike);

module.exports = router;
