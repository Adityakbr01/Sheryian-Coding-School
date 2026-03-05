const multer = require("multer");

// Use memory storage — files are kept as Buffer so they can be
// streamed directly to ImageKit without writing to disk.
const storage = multer.memoryStorage();

// File filter (only images allowed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;