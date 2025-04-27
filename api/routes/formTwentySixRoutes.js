import express from "express";
import { createFormTwentySix, getFormTwentySixByProcess, updateFormTwentySix } from "../controllers/formTwentySixController.js";
import upload from "../utils/fileUpload.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getFormTwentySixByProcess);
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "constructionPhotos", maxCount: 10 },
    { name: "loftInsulationDepthPhotos", maxCount: 10 },
    { name: "extensionRoomInRoofPhotos", maxCount: 10 },
  ]),
  createFormTwentySix
);
router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "constructionPhotos", maxCount: 10 },
    { name: "loftInsulationDepthPhotos", maxCount: 10 },
    { name: "extensionRoomInRoofPhotos", maxCount: 10 },
  ]),
  updateFormTwentySix
);

export default router;