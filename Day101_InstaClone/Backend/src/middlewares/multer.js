const multer = require("multer");
const ApiError = require("../utils/apiError");
const STATUS_CODES = require("../constants/statusCodes");

// Use memory storage so files can be sent directly to ImageKit
const storage = multer.memoryStorage();

/**
 * =========================================
 * FILE FILTER
 * =========================================
 * Allow only image files
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Only image files are allowed"
      ),
      false
    );
  }
};

/**
 * =========================================
 * MULTER INSTANCE
 * =========================================
 */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;