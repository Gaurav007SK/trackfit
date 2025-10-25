import User from "../models/User.js";
import Workout from "../models/Workout.js";

// @desc    Search users by username
// @route   GET /api/social/search?q=username
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    // Search for users (case-insensitive, partial match)
    // Exclude current user and limit to 20 results
    const users = await User.find({
      username: { $regex: q, $options: "i" },
      _id: { $ne: req.user._id }, // Exclude current user
    })
      .select("username createdAt") // Only return safe fields
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/social/profile/:userId
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info (excluding sensitive data)
    const user = await User.findById(userId).select("username createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's workout stats
    const workouts = await Workout.find({
      userId: userId,
      status: "completed",
    }).sort({ date: -1 });

    // Calculate stats
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce(
      (sum, w) => sum + w.exercises.reduce((s, ex) => s + ex.sets.length, 0),
      0
    );

    const totalVolume = workouts.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (s, ex) =>
            s + ex.sets.reduce((v, set) => v + set.weight * set.reps, 0),
          0
        ),
      0
    );

    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const avgDuration =
      totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0;

    // Calculate personal records
    const prs = {};
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (!prs[exercise.exerciseName]) {
            prs[exercise.exerciseName] = {
              weight: set.weight,
              reps: set.reps,
              date: workout.date,
            };
          } else if (set.weight > prs[exercise.exerciseName].weight) {
            prs[exercise.exerciseName] = {
              weight: set.weight,
              reps: set.reps,
              date: workout.date,
            };
          }
        });
      });
    });

    const topPRs = Object.entries(prs)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 5)
      .map(([name, record]) => ({
        exerciseName: name,
        ...record,
      }));

    // Recent workouts (last 5)
    const recentWorkouts = workouts.slice(0, 5).map((w) => ({
      _id: w._id,
      dayName: w.dayName,
      date: w.date,
      duration: w.duration,
      totalSets: w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
    }));

    // Calculate this week and month
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekWorkouts = workouts.filter(
      (w) => new Date(w.date) >= weekAgo
    ).length;
    const thisMonthWorkouts = workouts.filter(
      (w) => new Date(w.date) >= monthAgo
    ).length;

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        memberSince: user.createdAt,
      },
      stats: {
        totalWorkouts,
        totalSets,
        totalVolume: Math.round(totalVolume),
        avgDuration,
        thisWeekWorkouts,
        thisMonthWorkouts,
      },
      topPRs,
      recentWorkouts,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: error.message });
  }
};
