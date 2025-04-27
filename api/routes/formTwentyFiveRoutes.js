import express from "express";
import { createFormTwentyFive, getFormTwentyFiveByProcess, updateFormTwentyFive } from "../controllers/formTwentyFiveController.js";
import upload from "../utils/fileUpload.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getFormTwentyFiveByProcess);
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "alternativeWallsPhotos", maxCount: 10 },
    { name: "wallInsulationPhotos", maxCount: 10 },
  ]),
  createFormTwentyFive
);
router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "alternativeWallsPhotos", maxCount: 10 },
    { name: "wallInsulationPhotos", maxCount: 10 },
  ]),
  updateFormTwentyFive
);

export default router;