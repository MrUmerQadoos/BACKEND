import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import upload from "../utils/fileUpload.js";
import {
  createFormEighteen,
  getFormEighteenByProcess,
  updateFormEighteen,
} from "../controllers/formEighteenController.js";

const router = express.Router();

// Routes
router.post(
  "/",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([{ name: "newTechPhotos", maxCount: 10 }]),
  createFormEighteen
);

router.get("/", verifyToken, getFormEighteenByProcess);

router.put(
  "/:id",
  verifyToken,
  restrictTo("surveyor"),
  upload.fields([{ name: "newTechPhotos", maxCount: 10 }]),
  updateFormEighteen
);

export default router;