import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";
import {
  createFormSixteen,
  getFormSixteenByProcess,
  updateFormSixteen,
} from "../controllers/formSixteenController.js";

const router = express.Router();

// Define routes with middleware
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"), // Restrict to surveyor role
  upload.fields([{ name: "wwhrsPhotos", maxCount: 10 }]), // Adjust maxCount as needed
  createFormSixteen
);

router.get("/", verifyToken, getFormSixteenByProcess);

router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"), // Restrict to surveyor role
  upload.fields([{ name: "wwhrsPhotos", maxCount: 10 }]), // Adjust maxCount as needed
  updateFormSixteen
);

export default router;