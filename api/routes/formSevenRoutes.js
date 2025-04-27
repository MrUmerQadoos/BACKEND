import express from "express";
import { createFormSeven, updateFormSeven, getFormSevenByProcess } from "../controllers/formSevenController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// Create Form Seven (surveyor only)
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "wallInsulationPhotos", maxCount: 5 },
    { name: "alternativeWallsPhotos", maxCount: 5 },
    { name: "wallThicknessPhotos", maxCount: 5 },
  ]),
  createFormSeven
);

// Get Form Seven (all roles can view)
router.get(
  "/",
  verifyToken,
  restrictTo("admin", "manager", "surveyor", "viewer"),
  getFormSevenByProcess
);

// Update Form Seven (surveyor only)
router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "wallInsulationPhotos", maxCount: 5 },
    { name: "alternativeWallsPhotos", maxCount: 5 },
    { name: "wallThicknessPhotos", maxCount: 5 },
  ]),
  updateFormSeven
);

export default router;