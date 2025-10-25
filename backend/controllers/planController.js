import Plan from "../models/Plan.js";

// @desc    Get all plans for user
// @route   GET /api/plans
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user._id })
      .populate("schedule.exercises.exerciseId")
      .sort({ isActive: -1, createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate(
      "schedule.exercises.exerciseId"
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active plan
// @route   GET /api/plans/active
export const getActivePlan = async (req, res) => {
  try {
    const plan = await Plan.findOne({
      userId: req.user._id,
      isActive: true,
    }).populate("schedule.exercises.exerciseId");

    if (!plan) {
      return res.status(404).json({ message: "No active plan found" });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new plan
// @route   POST /api/plans
export const createPlan = async (req, res) => {
  try {
    const { name, daysPerWeek, schedule, isActive } = req.body;

    const plan = new Plan({
      userId: req.user._id,
      name,
      daysPerWeek,
      schedule,
      isActive: isActive || false,
    });

    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    Object.assign(plan, req.body);
    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Activate plan
// @route   PUT /api/plans/:id/activate
export const activatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    plan.isActive = true;
    await plan.save();
    res.json({ message: "Plan activated", plan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    await plan.deleteOne();
    res.json({ message: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
