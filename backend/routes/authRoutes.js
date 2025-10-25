import express from "express";
import {
  registerUser,
  loginUser,
  getSecurityQuestion,
  resetPassword,
  getUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/security-question", getSecurityQuestion);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, getUserProfile);

export default router;
