// Pre-populated Exercise Library
const exercises = [
  // PUSH EXERCISES
  {
    name: "Barbell Bench Press",
    category: "Push",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Barbell",
  },
  {
    name: "Incline Barbell Bench Press",
    category: "Push",
    muscleGroups: ["Upper Chest", "Triceps", "Shoulders"],
    equipment: "Barbell",
  },
  {
    name: "Dumbbell Bench Press",
    category: "Push",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Dumbbell",
  },
  {
    name: "Overhead Press",
    category: "Push",
    muscleGroups: ["Shoulders", "Triceps"],
    equipment: "Barbell",
  },
  {
    name: "Dumbbell Shoulder Press",
    category: "Push",
    muscleGroups: ["Shoulders", "Triceps"],
    equipment: "Dumbbell",
  },
  {
    name: "Dips",
    category: "Push",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Bodyweight",
  },
  {
    name: "Tricep Pushdowns",
    category: "Push",
    muscleGroups: ["Triceps"],
    equipment: "Cable",
  },
  {
    name: "Lateral Raises",
    category: "Push",
    muscleGroups: ["Shoulders"],
    equipment: "Dumbbell",
  },
  {
    name: "Cable Flyes",
    category: "Push",
    muscleGroups: ["Chest"],
    equipment: "Cable",
  },
  {
    name: "Skull Crushers",
    category: "Push",
    muscleGroups: ["Triceps"],
    equipment: "Barbell",
  },

  // PULL EXERCISES
  {
    name: "Deadlift",
    category: "Pull",
    muscleGroups: ["Back", "Hamstrings", "Glutes", "Traps"],
    equipment: "Barbell",
  },
  {
    name: "Barbell Row",
    category: "Pull",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Barbell",
  },
  {
    name: "Pull-ups",
    category: "Pull",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Bodyweight",
  },
  {
    name: "Lat Pulldown",
    category: "Pull",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Cable",
  },
  {
    name: "T-Bar Row",
    category: "Pull",
    muscleGroups: ["Back"],
    equipment: "Barbell",
  },
  {
    name: "Seated Cable Row",
    category: "Pull",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Cable",
  },
  {
    name: "Face Pulls",
    category: "Pull",
    muscleGroups: ["Rear Delts", "Upper Back"],
    equipment: "Cable",
  },
  {
    name: "Barbell Curl",
    category: "Pull",
    muscleGroups: ["Biceps"],
    equipment: "Barbell",
  },
  {
    name: "Hammer Curls",
    category: "Pull",
    muscleGroups: ["Biceps", "Forearms"],
    equipment: "Dumbbell",
  },
  {
    name: "Dumbbell Row",
    category: "Pull",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Dumbbell",
  },

  // LEG EXERCISES
  {
    name: "Barbell Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Barbell",
  },
  {
    name: "Front Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Core"],
    equipment: "Barbell",
  },
  {
    name: "Leg Press",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    equipment: "Machine",
  },
  {
    name: "Romanian Deadlift",
    category: "Legs",
    muscleGroups: ["Hamstrings", "Glutes"],
    equipment: "Barbell",
  },
  {
    name: "Leg Curl",
    category: "Legs",
    muscleGroups: ["Hamstrings"],
    equipment: "Machine",
  },
  {
    name: "Leg Extension",
    category: "Legs",
    muscleGroups: ["Quadriceps"],
    equipment: "Machine",
  },
  {
    name: "Bulgarian Split Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    equipment: "Dumbbell",
  },
  {
    name: "Lunges",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    equipment: "Dumbbell",
  },
  {
    name: "Calf Raises",
    category: "Legs",
    muscleGroups: ["Calves"],
    equipment: "Machine",
  },
  {
    name: "Hip Thrust",
    category: "Legs",
    muscleGroups: ["Glutes", "Hamstrings"],
    equipment: "Barbell",
  },

  // CORE EXERCISES
  {
    name: "Plank",
    category: "Core",
    muscleGroups: ["Abs", "Core"],
    equipment: "Bodyweight",
  },
  {
    name: "Crunches",
    category: "Core",
    muscleGroups: ["Abs"],
    equipment: "Bodyweight",
  },
  {
    name: "Hanging Leg Raises",
    category: "Core",
    muscleGroups: ["Abs", "Hip Flexors"],
    equipment: "Pull-up Bar",
  },
  {
    name: "Russian Twists",
    category: "Core",
    muscleGroups: ["Obliques", "Abs"],
    equipment: "Bodyweight",
  },
  {
    name: "Cable Crunches",
    category: "Core",
    muscleGroups: ["Abs"],
    equipment: "Cable",
  },
  {
    name: "Ab Wheel",
    category: "Core",
    muscleGroups: ["Abs", "Core"],
    equipment: "Ab Wheel",
  },
];

export default exercises;
