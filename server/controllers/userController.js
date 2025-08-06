import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import Cart from '../models/Cart.js';  
import { verify, verifyAdmin, createAccessToken, errorHandler } from "../auth.js";

// register 
export const register = (req, res) => {
  const { firstName, lastName, email, password, imageUrl } = req.body;

  if (!email.includes("@")) {
    return res.status(400).send({ message: "Email invalid" });
  }

  if (password.length < 8) {
    return res.status(400).send({ message: "Password must be at least 8 characters" });
  }

  User.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        throw { status: 400, message: "User already exists" };
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        imageUrl,
      });

      return newUser.save();
    })
    .then(newUser => {
      res.status(201).json({ user: newUser });
    })
    .catch(error => errorHandler(error, req, res, null));
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
export const getPurchasedCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const userCart = await Cart.findOne({ "user._id": userId });

    if (!userCart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }


    const purchasedCourses = userCart.courses
      .filter(courseItem => courseItem.isValidated)
      .map(courseItem => courseItem.course);

    res.status(200).json({ success: true, purchasedCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

