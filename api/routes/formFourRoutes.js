import express from "express";
import {
  createFormFour,
  getFormFourByProcess,
  updateFormFour,
} from "../controllers/formFourController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// Create Form Four (surveyor only)
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.array("photoThermalSeparation"),
  createFormFour
);

// Get Form Four (all roles can view)
router.get(
  "/",
  verifyToken,
  restrictTo("admin", "manager", "surveyor", "viewer"),
  getFormFourByProcess
);

// Update Form Four (surveyor only)
router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.array("photoThermalSeparation"),
  updateFormFour
);

export default router;