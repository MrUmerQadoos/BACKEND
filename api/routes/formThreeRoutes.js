import express from "express";
import {
  createFormThree,
  getFormThreeByProcess,
  updateFormThree,
} from "../controllers/formThreeController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create Form Three (surveyor only)
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  createFormThree
);

// Get Form Three (all roles can view)
router.get(
  "/",
  verifyToken,
  restrictTo("admin", "manager", "surveyor", "viewer"),
  getFormThreeByProcess
);

// Update Form Three (surveyor only)
router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  updateFormThree
);

export default router;