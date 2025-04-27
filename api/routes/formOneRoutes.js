import express from "express";
import { createFormOne, getFormOne, updateFormOne } from "../controllers/formOneController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { restrictTo } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create FormOne (surveyor only)
router.post("/", verifyToken, restrictTo("surveyor"), createFormOne);

// Get FormOne (admin, manager, viewer, surveyor)
router.get("/", verifyToken, restrictTo("admin", "manager", "viewer", "surveyor"), getFormOne);

// Update FormOne (surveyor only)
router.put("/:formId", verifyToken, restrictTo("surveyor"), updateFormOne);

export default router;