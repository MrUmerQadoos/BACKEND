import express from "express";
import { createFormTwentyThree, getFormTwentyThreeByProcess, updateFormTwentyThree } from "../controllers/formTwentyThreeController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getFormTwentyThreeByProcess);
router.post("/", verifyToken, createFormTwentyThree);
router.put("/:id", verifyToken, updateFormTwentyThree);

export default router;