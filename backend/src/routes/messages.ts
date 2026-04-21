import { Router } from "express";
import {
  getMedia,
  getMessages,
  tagMessage,
} from "../controllers/messagesController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.use(requireAuth);
router.get("/", getMessages);
router.post("/tag", tagMessage);
router.get("/media/:messageId", getMedia);

export default router;
