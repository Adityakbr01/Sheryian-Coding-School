const errorCodesGLOBAL = {
  MULTER: {
    LIMIT_FILE_SIZE: {
      status: 400,
      message: "File size exceeds limit (5MB)",
    },
    LIMIT_UNEXPECTED_FILE: {
      status: 400,
      message: "Unexpected file field",
    },
  },

  JWT: {
    JsonWebTokenError: {
      status: 401,
      message: "Invalid Token",
    },
    TokenExpiredError: {
      status: 401,
      message: "Token Expired",
    },
  },

  MONGODB: {
    DUPLICATE_KEY: {
      status: 409,
      message: "Resource already exists",
    },
  },

  MONGOOSE: {
    ValidationError: {
      status: 400,
      message: "Validation Error",
    },
    CastError: {
      status: 400,
      message: "Invalid resource ID",
    },
  },

  OTHER: {
    DEFAULT: {
      status: 500,
      message: "Internal Server Error",
    },
  },
};

module.exports = errorCodesGLOBAL;