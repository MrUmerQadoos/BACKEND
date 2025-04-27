import express from "express";
import {
  createFormFive,
  getFormFiveByProcess,
  updateFormFive,
} from "../controllers/formFiveController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// Create Form Five (surveyor only)
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.array("corridorPhotos"),
  createFormFive
);

// Get Form Five (all roles can view)
router.get(
  "/",
  verifyToken,
  restrictTo("admin", "manager", "surveyor", "viewer"),
  getFormFiveByProcess
);

// Update Form Five (surveyor only)
router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.array("corridorPhotos"),
  updateFormFive
);

export default router;