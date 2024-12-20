import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, age, gender, genderPreference } = req.body;
    if (!name || !email || !password || !age || !gender || !genderPreference) {
      return res.status(400).json({
        success: false,
        message: `All fields are required`,
      });
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: `You must be at least 18 years old to sign up`,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: `Password must contain at least 8 characters`,
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      age,
      gender,
      genderPreference,
    });

    const token = signToken(newUser._id);

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.log(`Error in signup controller ${error}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `All fields are required`,
      });
    }

    const user = await User.find({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(404).json({
        success: false,
        message: `Invalid username or password`,
      });
    }

    const token = signToken(user._id);

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(`Error in login controller ${error}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({
    success: true,
    message: `Logged out successfully`,
  });
};
