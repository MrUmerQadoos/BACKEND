import express from "express";
import upload from "../utils/fileUpload.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { createFormTwentyOne, getFormTwentyOneByProcess, updateFormTwentyOne } from "../controllers/formtwentyoneController.js";

const router = express.Router();

router.get("/", verifyToken, getFormTwentyOneByProcess);
router.post("/", verifyToken, upload.none(), createFormTwentyOne);
router.put("/:id", verifyToken, upload.none(), updateFormTwentyOne);

export default router;