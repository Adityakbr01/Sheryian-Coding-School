require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env.local"),
});
const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET:process.env.JWT_SECRET,
  JWT_EXPIRE:process.env.JWT_EXPIRE
};

Object.entries(ENV).forEach(([key, value]) => {
  if (!value) {
    console.log(`${key} is Undefined`);
    process.exit(1);
  }
});

console.log("✅ All environment variables loaded successfully");

module.exports = ENV;
