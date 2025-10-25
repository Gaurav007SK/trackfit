import express from "express";
import {
  getExercises,
  getExerciseById,
  createExercise,
  seedExercises,
} from "../controllers/exerciseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getExercises).post(protect, createExercise);

router.post("/seed", seedExercises);

router.route("/:id").get(getExerciseById);

export default router;
