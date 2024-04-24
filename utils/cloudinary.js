const cloudinary = require("cloudinary").v2;

const fs = require("fs");

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:  process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config({
  cloud_name: "do3exrhoc",
  api_key: "175993115272663",
  api_secret: "_t-_PA8MN_SUQZFd0Mfw6B5NDqM",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log(process.env.CLOUDINARY_API_KEY);
    if (!localFilePath) {
      return null;
    }
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    // console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log(error); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

module.exports = uploadOnCloudinary;
