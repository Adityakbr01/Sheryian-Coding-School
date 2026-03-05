const { toFile } = require("@imagekit/nodejs");
const imagekitClient = require("../configs/imageKitConf");

/**
 * =========================================
 * UPLOAD TO IMAGEKIT
 * =========================================
 * @description Uploads a file buffer (from multer memoryStorage)
 *              to ImageKit and returns the public URL.
 *
 * @param   {Express.Multer.File} file   - multer file object (has buffer, originalname, mimetype)
 * @param   {String}             folder  - ImageKit destination folder (e.g. "posts", "avatars")
 * @returns {String}                       public URL of the uploaded asset
 */
const uploadToImageKit = async (file, folder = "General") => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file received");
  }

  const uniqueFileName =
    Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;

  try {
    // Use toFile() helper to wrap the Buffer as required by @imagekit/nodejs v7
    const fileObject = await toFile(file.buffer, uniqueFileName);

    const response = await imagekitClient.files.upload({
      file: fileObject,
      fileName: uniqueFileName,
      folder: `/${folder}`,
      useUniqueFileName: false,
    });

    return response.url;
  } catch (error) {
    console.error("❌ ImageKit Upload Failed");
    console.error("   File     :", file.originalname);
    console.error("   MimeType :", file.mimetype);
    console.error("   Size     :", file.size, "bytes");
    console.error("   Folder   :", `/${folder}`);
    console.error("   Status   :", error.status ?? "N/A");
    console.error("   Message  :", error.message);

    // Re-throw so the service/controller can handle it
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
};

module.exports = uploadToImageKit;
