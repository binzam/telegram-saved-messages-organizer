import { Router } from "express";
const router = Router();
import {
  sendCode,
  verifyCode,
  verifyPassword,
  checkAuthStatus,
  logout,
} from "../controllers/authController.js";

router.post("/send-code", sendCode);
router.post("/verify-code", verifyCode);
router.post("/verify-password", verifyPassword);
router.get("/status", checkAuthStatus);
router.post("/logout", logout);

export default router;
