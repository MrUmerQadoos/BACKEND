import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";
import { createFormFifteen, getFormFifteenByProcess, updateFormFifteen } from "../controllers/formFifteenController.js";


const router = express.Router();

// Define routes with middleware
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"), // Restrict to surveyor role
  upload.fields([{ name: "solarPhotos", maxCount: 10 }]), // Adjust maxCount as needed
  createFormFifteen
);

router.get("/", verifyToken, getFormFifteenByProcess);

router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"), // Restrict to surveyor role
  upload.fields([{ name: "solarPhotos", maxCount: 10 }]), // Adjust maxCount as needed
  updateFormFifteen
);

export default router;