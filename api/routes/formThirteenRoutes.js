import express from "express";
import {
  createFormThirteen,
  getFormThirteenByProcess,
  updateFormThirteen,
} from "../controllers/formThirteenController.js";

import upload from "../utils/fileUpload.js";


const router = express.Router();

// Routes
router.post(
  "/",
  upload.fields([
    { name: "mainHeating1Photos", maxCount: 10 },
    { name: "mainHeating2Photos", maxCount: 10 },
    { name: "secondaryHeatingPhotos", maxCount: 10 },
  ]),
  createFormThirteen
);
router.get("/", getFormThirteenByProcess);
router.put(
  "/:id",
  upload.fields([
    { name: "mainHeating1Photos", maxCount: 10 },
    { name: "mainHeating2Photos", maxCount: 10 },
    { name: "secondaryHeatingPhotos", maxCount: 10 },
  ]),
  updateFormThirteen
);

export default router;