import express from "express";
import { createFormTwentyTwo, getFormTwentyTwoByProcess, updateFormTwentyTwo } from "../controllers/formTwentyTwoController.js";
import upload from "../utils/fileUpload.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getFormTwentyTwoByProcess);
router.post("/", verifyToken, upload.fields([{ name: "extensionRoomPhotos", maxCount: 10 }]), createFormTwentyTwo);
router.put("/:id", verifyToken, upload.fields([{ name: "extensionRoomPhotos", maxCount: 10 }]), updateFormTwentyTwo);

export default router;