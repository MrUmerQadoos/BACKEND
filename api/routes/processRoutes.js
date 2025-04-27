import express from "express";
import { createProcess, getProcessesByUser } from "../controllers/processController.js";

const router = express.Router();

// POST /api/processes - create a new process
router.post("/", createProcess);

// GET /api/processes?userId=xxx - fetch all processes for a given user
router.get("/", getProcessesByUser);

export default router;
