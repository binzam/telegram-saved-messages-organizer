import { Router } from "express";
const router = Router();
import {
  getMedia,
  getMessages,
  tagMessage,
} from "../controllers/messagesController.js";
import { requireAuth } from "../middlewares/requireAuth.js";


router.use(requireAuth);
router.get("/", getMessages);
router.post("/tag", tagMessage);
router.get("/media/:messageId", getMedia);

export default router;
