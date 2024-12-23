import User from "../models/user.model.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const swipeRight = async (req, res) => {
  try {
    const { likedUserId } = req.params;
    const currentUser = await User.findById(req.user._id);
    const likedUser = await User.findById(likedUserId);
    if (!likedUser) {
      return res.status(404).json({
        success: false,
        message: `User not found`,
      });
    }
    if (!currentUser.likes.includes(likedUserId)) {
      currentUser.likes.push(likedUserId);
      await currentUser.save();
      if (likedUser.likes.includes(currentUser._id)) {
        currentUser.matches.push(likedUserId);
        likedUser.matches.push(currentUser._id);
        await Promise.all([currentUser.save(), likedUser.save()]);

        const connectedUsers = getConnectedUsers();
        const io = getIO();

        const likedUserSocketId = connectedUsers.get(likedUserId);
        if (likedUserSocketId) {
          io.to(likedUserSocketId).emit("newMatch", {
            _id: currentUser._id,
            name: currentUser.name,
            image: currentUser.image,
          });
        }

        const currentUserSocketId = connectedUsers.get(
          currentUser._id.toString()
        );
        if (currentUserSocketId) {
          io.to(currentUserSocketId).emit("newMatch", {
            _id: likedUserId,
            name: likedUser.name,
            image: likedUser.image,
          });
        }
      }
    }
    res.status(201).json({
      success: true,
      user: currentUser,
    });
  } catch (error) {
    console.log(`Error in swipe right controller ${error}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const swipeLeft = async (req, res) => {
  try {
    const { dislikedUserId } = req.params;
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.dislikes.includes(dislikedUserId)) {
      currentUser.dislikes.push(dislikedUserId);
      await currentUser.save();
    }
    res.status(201).json({
      success: true,
      user: currentUser,
    });
  } catch (error) {
    console.log(`Error in swipe right controller ${error}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const getUserProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUser._id } },
        { _id: { $nin: currentUser.likes } },
        { _id: { $nin: currentUser.dislikes } },
        {
          gender:
            currentUser.genderPreference === "both"
              ? { $in: ["male", "female"] }
              : currentUser.genderPreference,
        },
        { genderPreference: { $in: [currentUser.gender, "both"] } },
      ],
    });

    res.status(201).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(`Error in get user profiles controller ${error}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "matches",
      "name image"
    );

    res.status(201).json({
      success: true,
      matches: user.matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};
