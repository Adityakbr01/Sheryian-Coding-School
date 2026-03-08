require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env.local"),
});
const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3001",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
};

Object.entries(ENV).forEach(([key, value]) => {
  if (!value) {
    console.log(`${key} is Undefined`);
    process.exit(1);
  }
});

console.log("✅ All environment variables loaded successfully");

module.exports = ENV;
