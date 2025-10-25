import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    securityQuestion: {
      type: String,
      required: [true, "Security question is required"],
    },
    securityAnswer: {
      type: String,
      required: [true, "Security answer is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Hash security answer before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("securityAnswer")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.securityAnswer = await bcrypt.hash(
    this.securityAnswer.toLowerCase().trim(),
    salt
  );
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare security answer
userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  return await bcrypt.compare(
    candidateAnswer.toLowerCase().trim(),
    this.securityAnswer
  );
};

const User = mongoose.model("User", userSchema);

export default User;
