const { toFile } = require("@imagekit/nodejs");
const imagekitClient = require("../configs/imageKitConf");
const ApiError = require("./apiError");
const statusMessage = require("../constants/statusMessages");
const STATUS_CODES = require("../constants/statusCodes");

/**
 * =========================================
 * UPLOAD TO IMAGEKIT
 * =========================================
 * @description Uploads a file buffer (from multer memoryStorage)
 *              to ImageKit and returns the public URL.
 *
 * @param   {Express.Multer.File} file   - multer file object
 * @param   {String} folder              - destination folder
 * @returns {String}                     public URL of uploaded image
 */

const uploadToImageKit = async (file, folder = "General") => {
  if (!file || !file.buffer) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      statusMessage.inValideFileRec
    );
  }

  const uniqueFileName =
    `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;

  try {
    const fileObject = await toFile(file.buffer, uniqueFileName);

    const response = await imagekitClient.files.upload({
      file: fileObject,
      fileName: uniqueFileName,
      folder: `cohort-2-insta-Clone/${folder}`,
      useUniqueFileName: false,
    });

    return response.url;
  } catch (error) {
    console.error("❌ ImageKit Upload Failed");
    console.error({
      file: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder: `/${folder}`,
      status: error.status ?? "N/A",
      message: error.message,
    });

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Image upload failed"
    );
  }
};

module.exports = uploadToImageKit;