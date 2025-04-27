import express from "express";
import { createFormTwo, getFormTwo, updateFormTwo } from "../controllers/formTwoController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";


const router = express.Router();

// Create Form Two (surveyor only)
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "elevationPhotos", maxCount: 10 },
    { name: "additionalPhotos", maxCount: 10 },
  ]),
  createFormTwo
);

// Get Form Two (all roles can view)
router.get("/", verifyToken, restrictTo("admin", "manager", "surveyor", "viewer"), getFormTwo);

// Update Form Two (surveyor only)
router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "elevationPhotos", maxCount: 10 },
    { name: "additionalPhotos", maxCount: 10 },
  ]),
  updateFormTwo
);

export default router;