import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Push", "Pull", "Legs", "Core", "Cardio"],
    },
    muscleGroups: [
      {
        type: String,
        required: true,
      },
    ],
    equipment: {
      type: String,
      default: "Barbell",
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.isCustom;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
exerciseSchema.index({ name: "text" });
exerciseSchema.index({ category: 1 });

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;
