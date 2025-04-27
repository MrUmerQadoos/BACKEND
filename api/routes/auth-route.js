import express from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/check-auth", verifyToken, checkAuth);
router.post("/create-user", verifyToken, createUser);
router.get("/users", verifyToken, getAllUsers);
router.put("/users/:userId", verifyToken, updateUser);
router.delete("/users/:userId", verifyToken, deleteUser);

export default router;