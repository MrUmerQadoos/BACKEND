import express from "express";
import { createFormNine, updateFormNine, getFormNineByProcess } from "../controllers/formNineController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// Create Form Nine (surveyor only)
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "mainRoomPhotos", maxCount: 5 },
  ]),
  createFormNine
);

// Get Form Nine (all roles can view)
router.get(
  "/",
  verifyToken,
  restrictTo("admin", "manager", "surveyor", "viewer"),
  getFormNineByProcess
);

// Update Form Nine (surveyor only)
router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([
    { name: "mainRoomPhotos", maxCount: 5 },
  ]),
  updateFormNine
);

export default router;