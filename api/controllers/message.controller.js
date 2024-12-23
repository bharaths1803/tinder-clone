import Message from "../models/message.model.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    const io = getIO();
    const connectedUsers = getConnectedUsers();
    const receiverSocketId = connectedUsers.get(receiverId);

    io.to(receiverSocketId).emit("newMessage", {
      message: newMessage,
    });

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.log(`Error in send message controller ${error}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort("createdAt");

    res.status(201).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(`Error in get conversation controller ${error}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};
