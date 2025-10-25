import express from "express";
import {
  getPlans,
  getPlanById,
  getActivePlan,
  createPlan,
  updatePlan,
  activatePlan,
  deletePlan,
} from "../controllers/planController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPlans).post(protect, createPlan);

router.get("/active", protect, getActivePlan);

router
  .route("/:id")
  .get(protect, getPlanById)
  .put(protect, updatePlan)
  .delete(protect, deletePlan);

router.put("/:id/activate", protect, activatePlan);

export default router;
