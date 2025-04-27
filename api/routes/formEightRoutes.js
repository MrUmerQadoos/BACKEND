import express from "express";
import { createFormEight, updateFormEight, getFormEightByProcess } from "../controllers/formEightController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// Create Form Eight (surveyor only)
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "constructionPhotos", maxCount: 5 },
    { name: "loftInsulationPhotos", maxCount: 5 },
  ]),
  createFormEight
);

// Get Form Eight (all roles can view)
router.get(
  "/",
  verifyToken,
  restrictTo("admin", "manager", "surveyor", "viewer"),
  getFormEightByProcess
);

// Update Form Eight (surveyor only)
router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "constructionPhotos", maxCount: 5 },
    { name: "loftInsulationPhotos", maxCount: 5 },
  ]),
  updateFormEight
);

export default router;