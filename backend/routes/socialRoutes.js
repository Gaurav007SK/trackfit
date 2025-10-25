import express from "express";
import {
  searchUsers,
  getUserProfile,
} from "../controllers/socialController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/profile/:userId", protect, getUserProfile);

export default router;
