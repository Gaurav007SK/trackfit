import Exercise from "../models/Exercise.js";
import exercisesData from "../data/exercises.js";

// @desc    Get all exercises
// @route   GET /api/exercises
export const getExercises = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const exercises = await Exercise.find(query).sort({ name: 1 });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
export const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create custom exercise
// @route   POST /api/exercises
export const createExercise = async (req, res) => {
  try {
    const { name, category, muscleGroups, equipment } = req.body;

    const exercise = new Exercise({
      name,
      category,
      muscleGroups,
      equipment,
      isCustom: true,
      userId: req.user._id,
    });

    const createdExercise = await exercise.save();
    res.status(201).json(createdExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Seed exercise database
// @route   POST /api/exercises/seed
export const seedExercises = async (req, res) => {
  try {
    await Exercise.deleteMany({ isCustom: false });
    const exercises = await Exercise.insertMany(exercisesData);
    res.status(201).json({
      message: `${exercises.length} exercises seeded successfully`,
      count: exercises.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
