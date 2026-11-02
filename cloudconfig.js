require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

cloudinary.uploader.upload(
  "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60",
  { folder: "wanderlust_DEV" },
  (error, result) => {
    if (error) {
      console.error("\nCLOUDINARY REJECTED UPLOAD (403):");
      console.error(error);
    } else {
      console.log("\nSUCCESS: Cloudinary accepted the upload!");
      console.log("Uploaded Image URL:", result.secure_url);
    }
  }
);
