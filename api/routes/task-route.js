import express from "express";
import { createTask, getTasks, updateTaskStatus } from "../controllers/task-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createTask);
router.get("/", verifyToken, getTasks);
router.put("/status", verifyToken, updateTaskStatus);

export default router;