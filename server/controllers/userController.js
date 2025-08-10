import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";

import cloudinary from "cloudinary"; 
import Cart from '../models/Cart.js';  
import { Purchase } from "../models/Purchase.js";
import { verify, verifyAdmin, createAccessToken, errorHandler } from "../auth.js";


// registration
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const imageFile = req.file;

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email invalid" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let imageUrl = "";
    if (imageFile) {
      const uploadedImage = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = uploadedImage.secure_url;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      imageUrl,
    });

    await newUser.save();


    const token = createAccessToken(newUser);

    res.status(201).json({ user: newUser, token, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = createAccessToken(user);

    res.json({ message: "Login successful", token });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};


// get user details with id  profile ma kam lauxa yo 
export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("enrolledCourses");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};

// update user info by admin
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, affiliateEarnings } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if email is already used by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use by another user" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, affiliateEarnings },
      { new: true, runValidators: true }
    ).select('-password'); // exclude password

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// get user by id
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// reset password 
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};

// make admin
export const makeUserAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isAdmin = true;
    await user.save();

    res.json({ message: "User is now an admin" });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};
 
// get purchased courses with id yesle chai specific person ko matra dinxa 
export const getUserPurchasedCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all completed purchases for the user
    const purchases = await Purchase.find({ userId, status: 'completed' })
      .populate('courseId', 'courseTitle coursePrice courseContent'); 

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ success: false, message: "No purchased courses found" });
    }

    // Extract course data from purchases
    const purchasedCourses = purchases.map(purchase => purchase.courseId);

    res.status(200).json({
      success: true,
      purchasedCourses,
    });
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching purchased courses",
    });
  }
};
