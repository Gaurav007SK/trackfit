import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    plannedDayId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    dayName: {
      type: String,
      default: "Custom Workout",
    },
    exercises: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        exerciseName: {
          type: String,
          required: true,
        },
        wasPlanned: {
          type: Boolean,
          default: true,
        },
        targetSets: {
          type: Number,
          default: 3,
        },
        targetReps: {
          type: Number,
          default: 10,
        },
        sets: [
          {
            setNumber: {
              type: Number,
              required: true,
            },
            weight: {
              type: Number,
              required: true,
              min: 0,
            },
            reps: {
              type: Number,
              required: true,
              min: 0,
            },
            completed: {
              type: Boolean,
              default: true,
            },
          },
        ],
        notes: {
          type: String,
          default: "",
        },
      },
    ],
    status: {
      type: String,
      enum: ["in-progress", "completed", "skipped"],
      default: "in-progress",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
workoutSchema.index({ userId: 1, date: -1 });
workoutSchema.index({ userId: 1, status: 1 });

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;
