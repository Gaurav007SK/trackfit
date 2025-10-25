import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    daysPerWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    schedule: [
      {
        dayName: {
          type: String,
          required: true,
        },
        dayNumber: {
          type: Number,
          required: true,
        },
        weekDay: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: false,
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
            targetSets: {
              type: Number,
              default: 3,
            },
            targetReps: {
              type: Number,
              default: 10,
            },
            order: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active plan per user
planSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
