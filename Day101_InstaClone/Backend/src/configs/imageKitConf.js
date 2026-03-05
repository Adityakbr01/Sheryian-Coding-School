const { ImageKit } = require("@imagekit/nodejs");
const ENV = require("./env");

/**
 * =========================================
 * IMAGEKIT CONFIG
 * =========================================
 * @description Initialises the ImageKit SDK client
 *              used for uploading media assets.
 */
const imagekitClient = new ImageKit({
  privateKey: ENV.IMAGEKIT_PRIVATE_KEY,
});

module.exports = imagekitClient;