import express from "express";
import {
  createFormTen,
  getFormTenByProcess,
  updateFormTen,
} from "../controllers/formTenController.js";
import upload from "../utils/fileUpload.js";


const router = express.Router();

// Routes
router.post("/", upload.fields([{ name: "floorPhotos", maxCount: 10 }]), createFormTen);
router.get("/", getFormTenByProcess);
router.put(
  "/:id",
  upload.fields([{ name: "floorPhotos", maxCount: 10 }]),
  updateFormTen
);

export default router;