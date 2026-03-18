const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("woff2");

config.resolver.alias = {
  "@": path.resolve(__dirname, "src"),
  "@assets": path.resolve(__dirname, "assets"),
   'woff2': path.resolve(__dirname, 'assets/fonts/woff2'),
};

module.exports = config;