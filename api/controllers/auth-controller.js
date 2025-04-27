import { User } from "../model/user.js";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateJWTToken } from "../utils/generateJWTToken.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../resend/email.js";
import crypto from "crypto";

export const signup = async (req, res) => {
  const { name, email, password, role = "viewer" } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const validRoles = ["admin", "manager", "surveyor", "viewer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Auto-verify user
    });

    await user.save();

    generateJWTToken(res, user._id, user.role);

    // Skip sending verification email
    // await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log("Error in signup:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin/Manager create user (authenticated endpoint for creating users with roles)
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const creator = req.user; // From verifyToken middleware (includes _id and role)

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Authorization check
    if (creator.role !== "admin" && creator.role !== "manager") {
      return res.status(403).json({ message: "Unauthorized: Only Admin or Manager can create users" });
    }

    if (creator.role === "manager" && role === "admin") {
      return res.status(403).json({ message: "Managers cannot create Admins" });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Users created by Admin/Manager are auto-verified
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log("Error in createUser:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Removed isVerified check since users are auto-verified
    generateJWTToken(res, user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log("Error logging in:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error logging out:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    if (!code) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.log("Error verifying email:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully!",
    });
  } catch (error) {
    console.log("Error sending password reset email:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error resetting password:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Check Authentication
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error checking auth:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Users (Admin/Viewer only)
export const getAllUsers = async (req, res) => {
  const requesterRole = req.user.role;

  try {
    if (requesterRole !== "admin" && requesterRole !== "viewer") {
      return res.status(403).json({ message: "Unauthorized: Only Admin or Viewer can view all users" });
    }

    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update User (Admin only, e.g., change role or details)
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, password } = req.body;
  const requesterRole = req.user.role;

  try {
    if (requesterRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only Admin can update users" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) {
      const validRoles = ["admin", "manager", "surveyor", "viewer"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      user.role = role;
    }
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log("Error updating user:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete User (Admin only)
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const requesterRole = req.user.role;

  try {
    if (requesterRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only Admin can delete users" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await User.deleteOne({ _id: userId });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting user:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};