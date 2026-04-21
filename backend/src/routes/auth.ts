import { Router } from "express";
import {
  sendCode,
  verifyCode,
  verifyPassword,
  checkAuthStatus,
  logout,
} from "../controllers/authController.js";

const router = Router();

router.post("/send-code", sendCode);
router.post("/verify-code", verifyCode);
router.post("/verify-password", verifyPassword);
router.get("/status", checkAuthStatus);
router.post("/logout", logout);

export default router;
