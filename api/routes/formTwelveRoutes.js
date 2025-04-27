import express from "express";
import {
  createFormTwelve,
  getFormTwelveByProcess,
  updateFormTwelve,
} from "../controllers/formTwelveController.js";

import upload from "../utils/fileUpload.js";

const router = express.Router();

// Routes
router.post(
  "/",
  upload.fields([{ name: "ventilationCoolingPhotos", maxCount: 10 }]),
  createFormTwelve
);
router.get("/", getFormTwelveByProcess);
router.put(
  "/:id",
  upload.fields([{ name: "ventilationCoolingPhotos", maxCount: 10 }]),
  updateFormTwelve
);

export default router;