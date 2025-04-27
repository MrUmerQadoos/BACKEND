import express from "express";
import { createFormTwentyFour, getFormTwentyFourByProcess, updateFormTwentyFour } from "../controllers/formTwentyFourController.js";
import upload from "../utils/fileUpload.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getFormTwentyFourByProcess);
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "constructionPhotos", maxCount: 10 },
    { name: "wallInsulationPhotos", maxCount: 10 },
  ]),
  createFormTwentyFour
);
router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "constructionPhotos", maxCount: 10 },
    { name: "wallInsulationPhotos", maxCount: 10 },
  ]),
  updateFormTwentyFour
);

export default router;