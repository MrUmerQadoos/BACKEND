import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import {
  createFormSeventeen,
  getFormSeventeenByProcess,
  updateFormSeventeen,
} from "../controllers/formSeventeenController.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// Define routes with middleware
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"), // Restrict to surveyor role
  upload.fields([{ name: "fghrsPhotos", maxCount: 10 }]), // Adjust maxCount as needed
  createFormSeventeen
);

router.get("/", verifyToken, getFormSeventeenByProcess);

router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"), // Restrict to surveyor role
  upload.fields([{ name: "fghrsPhotos", maxCount: 10 }]), // Adjust maxCount as needed
  updateFormSeventeen
);

export default router;