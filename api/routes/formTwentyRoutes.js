import express from "express";
import { createFormTwenty, getFormTwentyByProcess, updateFormTwenty } from "../controllers/formTwentyController.js";
import upload from "../utils/fileUpload.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getFormTwentyByProcess);
router.post("/", verifyToken, upload.fields([{ name: "checklistPhotos", maxCount: 10 }]), createFormTwenty);
router.put("/:id", verifyToken, upload.fields([{ name: "checklistPhotos", maxCount: 10 }]), updateFormTwenty);

export default router;