import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

export const updateProfile = async (req, res) => {
  try {
    const { image, ...otherData } = req.body;
    let updatedData = otherData;
    if (image) {
      if (image.startsWith("data:image")) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(image);
          updatedData.image = uploadResponse.secure_url;
        } catch (error) {
          console.log(`Error in uploading image to cloudinary ${error}`);
          res.status(400).json({
            success: false,
            message: `Internal server error`,
          });
        }
      }
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      { new: true }
    );

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log(`Error in update profile controller ${error}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};
