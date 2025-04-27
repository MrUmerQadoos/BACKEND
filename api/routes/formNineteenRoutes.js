import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";
import {
  createFormNineteen,
  getFormNineteenByProcess,
  updateFormNineteen,
} from "../controllers/formNineteenController.js";

const router = express.Router();

// Routes
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([{ name: "otherDetailsPhotos", maxCount: 10 }]),
  createFormNineteen
);

router.get("/", verifyToken, getFormNineteenByProcess);

router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([{ name: "otherDetailsPhotos", maxCount: 10 }]),
  updateFormNineteen
);

export default router;