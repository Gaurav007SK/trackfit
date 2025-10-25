import Workout from "../models/Workout.js";
import Plan from "../models/Plan.js";

// @desc    Get today's suggested workout
// @route   GET /api/workouts/today
export const getTodaysWorkout = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already a workout for today (in-progress or completed)
    let workout = await Workout.findOne({
      userId: req.user._id,
      date: { $gte: today },
    })
      .sort({ date: -1 })
      .populate("exercises.exerciseId");

    if (workout) {
      // Return the workout with its current status
      return res.json(workout);
    }

    // If no workout today, suggest from active plan
    const activePlan = await Plan.findOne({
      userId: req.user._id,
      isActive: true,
    });

    if (!activePlan) {
      return res.json({
        message: "No active plan. Start a custom workout!",
        workout: null,
      });
    }

    // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDayOfWeek = new Date().getDay();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayName = daysOfWeek[currentDayOfWeek];

    // Try to find a workout scheduled for today's weekday
    let suggestedDay = activePlan.schedule.find((d) => d.weekDay === todayName);

    // If no workout scheduled for today, get the next workout in sequence
    if (!suggestedDay) {
      const lastWorkout = await Workout.findOne({
        userId: req.user._id,
        planId: activePlan._id,
        status: "completed",
      }).sort({ date: -1 });

      let nextDayNumber = 1;
      if (lastWorkout && lastWorkout.plannedDayId) {
        const lastDay = activePlan.schedule.find(
          (d) => d._id.toString() === lastWorkout.plannedDayId.toString()
        );
        if (lastDay) {
          nextDayNumber = (lastDay.dayNumber % activePlan.daysPerWeek) + 1;
        }
      }

      suggestedDay = activePlan.schedule.find(
        (d) => d.dayNumber === nextDayNumber
      );
    }

    res.json({
      suggested: true,
      plan: activePlan,
      day: suggestedDay,
      todayIs: todayName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start new workout
// @route   POST /api/workouts/start
export const startWorkout = async (req, res) => {
  try {
    const { planId, plannedDayId, dayName, exercises } = req.body;

    // Check if there's already an in-progress workout today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingWorkout = await Workout.findOne({
      userId: req.user._id,
      date: { $gte: today },
      status: "in-progress",
    });

    if (existingWorkout) {
      return res.json(existingWorkout);
    }

    // Create workout with planned exercises
    const workoutExercises = exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      wasPlanned: true,
      targetSets: ex.targetSets || 3,
      targetReps: ex.targetReps || 10,
      sets: [],
      notes: "",
    }));

    const workout = new Workout({
      userId: req.user._id,
      planId,
      plannedDayId,
      dayName,
      exercises: workoutExercises,
      status: "in-progress",
    });

    const createdWorkout = await workout.save();
    res.status(201).json(createdWorkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add exercise to workout
// @route   POST /api/workouts/:id/exercise
export const addExerciseToWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    const { exerciseId, exerciseName, wasPlanned } = req.body;

    workout.exercises.push({
      exerciseId,
      exerciseName,
      wasPlanned: wasPlanned || false,
      sets: [],
    });

    await workout.save();
    res.json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Log a set
// @route   POST /api/workouts/:id/set
export const logSet = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { exerciseIndex, setNumber, weight, reps } = req.body;

    if (exerciseIndex >= workout.exercises.length) {
      return res.status(400).json({ message: "Invalid exercise index" });
    }

    workout.exercises[exerciseIndex].sets.push({
      setNumber,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      completed: true,
    });

    await workout.save();
    res.json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a set
// @route   PUT /api/workouts/:id/set
export const updateSet = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { exerciseIndex, setIndex, weight, reps } = req.body;

    if (exerciseIndex >= workout.exercises.length) {
      return res.status(400).json({ message: "Invalid exercise index" });
    }

    if (setIndex >= workout.exercises[exerciseIndex].sets.length) {
      return res.status(400).json({ message: "Invalid set index" });
    }

    workout.exercises[exerciseIndex].sets[setIndex].weight = parseFloat(weight);
    workout.exercises[exerciseIndex].sets[setIndex].reps = parseInt(reps);

    await workout.save();
    res.json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a set
// @route   DELETE /api/workouts/:id/set
export const deleteSet = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { exerciseIndex, setIndex } = req.body;

    if (exerciseIndex >= workout.exercises.length) {
      return res.status(400).json({ message: "Invalid exercise index" });
    }

    workout.exercises[exerciseIndex].sets.splice(setIndex, 1);

    // Renumber remaining sets
    workout.exercises[exerciseIndex].sets.forEach((set, idx) => {
      set.setNumber = idx + 1;
    });

    await workout.save();
    res.json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Complete workout
// @route   PUT /api/workouts/:id/complete
export const completeWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Check if workout belongs to the user
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    workout.status = "completed";
    workout.endTime = new Date();
    workout.duration = Math.floor((workout.endTime - workout.startTime) / 1000);

    await workout.save();
    res.json(workout);
  } catch (error) {
    console.error("Error completing workout:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get workout history
// @route   GET /api/workouts/history
export const getWorkoutHistory = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const workouts = await Workout.find({
      userId: req.user._id,
      status: "completed",
    })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("exercises.exerciseId");

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific workout
// @route   GET /api/workouts/:id
export const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate(
      "exercises.exerciseId"
    );

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
