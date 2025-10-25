import express from "express";
import {
  getTodaysWorkout,
  startWorkout,
  addExerciseToWorkout,
  logSet,
  updateSet,
  deleteSet,
  completeWorkout,
  getWorkoutHistory,
  getWorkoutById,
} from "../controllers/workoutController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/today", protect, getTodaysWorkout);
router.post("/start", protect, startWorkout);
router.get("/history", protect, getWorkoutHistory);

router.route("/:id").get(protect, getWorkoutById);

router.post("/:id/exercise", protect, addExerciseToWorkout);
router.post("/:id/set", protect, logSet);
router.put("/:id/set", protect, updateSet);
router.delete("/:id/set", protect, deleteSet);
router.put("/:id/complete", protect, completeWorkout);

export default router;
