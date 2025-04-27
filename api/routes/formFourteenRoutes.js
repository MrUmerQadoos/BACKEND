import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";
import {
  createFormFourteen,
  getFormFourteenByProcess,
  updateFormFourteen,
} from "../controllers/formFourteenController.js"; // Adjust path if needed

const router = express.Router();

// Routes
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([{ name: "waterHeatingPhotos", maxCount: 10 }]),
  createFormFourteen
);

router.get("/", verifyToken, getFormFourteenByProcess);

router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([{ name: "waterHeatingPhotos", maxCount: 10 }]),
  updateFormFourteen
);

export default router;