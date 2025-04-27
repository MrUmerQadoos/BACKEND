import express from "express";
import { createFormSix, updateFormSix, getFormSixByProcess } from "../controllers/formSixController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// Create Form Six (surveyor only)
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "constructionPhotos", maxCount: 5 },
    { name: "insulationPhotos", maxCount: 5 },
    { name: "thicknessPhotos", maxCount: 5 },
  ]),
  createFormSix
);

// Get Form Six (all roles can view)
router.get(
  "/",
  verifyToken,
  restrictTo("admin", "manager", "surveyor", "viewer"),
  getFormSixByProcess
);

// Update Form Six (surveyor only)
router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "constructionPhotos", maxCount: 5 },
    { name: "insulationPhotos", maxCount: 5 },
    { name: "thicknessPhotos", maxCount: 5 },
  ]),
  updateFormSix
);

export default router;