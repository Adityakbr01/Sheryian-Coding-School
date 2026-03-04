/**
 * =========================================
 * COOKIE CONFIGURATION
 * =========================================
 * @description Secure cookie options for JWT
 */

const ENV = require("./env");

const cookieConf = {
  httpOnly: true,
  secure: ENV.NODE_ENV === "production", 
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

module.exports = cookieConf;