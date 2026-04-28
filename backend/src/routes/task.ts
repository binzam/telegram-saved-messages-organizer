import { Router } from "express";
import { createTask, getTasksByMessage } from "../controllers/taskController.js";

const router = Router();

router.post("/new", createTask);
router.get("/:messageId", getTasksByMessage);
export default router;
