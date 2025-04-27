import express from "express";
import {
  createFormEleven,
  getFormElevenByProcess,
  updateFormEleven,
} from "../controllers/formElevenController.js";
import upload from "../utils/fileUpload.js";


const router = express.Router();

// Routes
router.post(
  "/",
  upload.fields([
    { name: "structurePhotos", maxCount: 10 },
    { name: "insulationPhotos", maxCount: 10 },
  ]),
  createFormEleven
);
router.get("/", getFormElevenByProcess);
router.put(
  "/:id",
  upload.fields([
    { name: "structurePhotos", maxCount: 10 },
    { name: "insulationPhotos", maxCount: 10 },
  ]),
  updateFormEleven
);

export default router;