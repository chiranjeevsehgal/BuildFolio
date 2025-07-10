const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      default: "",
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    username: {
      type: String,
      // required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-z0-9._-]+$/,
        "Username can only contain letters, numbers, dots, underscores, and hyphens",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.oauthProvider;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // OAuth Info
    oauthProvider: {
      type: String,
      enum: ["google", "linkedin", "github"],
      default: null,
    },
    oauthId: {
      type: String,
      default: null,
    },

    // Profile Data
    profilePhoto: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },

    // Professional Info
    title: {
      type: String,
      default: null,
    },
    selectedTemplate: {
      type: String,
      enum: [
        "modern-professional",
        "minimal-clean",
        "creative-gradient",
        "terminal-developer-focused",
        "executive-suite",
      ],
      default: null,
    },
    careerStage: {
      type: String,
      enum: [
        "",
        "Entry Level (0-2 Years)",
        "Mid Level (2-6 Years)",
        "Senior Level (6-12 Years)",
        "Executive Level (12+ Years)",
      ],
      default: null,
    },

    // Settings Resume Info
    industry: {
      type: String,
      enum: [
        "",
        "Technology",
        "Healthcare",
        "Finance",
        "Education",
        "Marketing",
        "Sales",
        "Engineering",
        "Design",
        "Other",
      ],
      default: null,
    },
    jobSearchTimeline: {
      type: String,
      enum: [
        "",
        "Immediately",
        "Within 1 month",
        "Within 3 months",
        "Within 6 months",
        "Not actively looking",
      ],
      default: null,
    },
    resumeExperience: {
      type: String,
      default: null,
    },

    // Account Status
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    portfolioDeployed: { type: Boolean, default: false },
    portfolioUrl: String,
    deployedAt: Date,

    // Subscription
    subscriptionType: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },

    // Deactivation tracking
    deactivatedAt: {
      type: Date,
      index: true,
    },
    deactivationReason: {
      type: String,
      enum: [
        "User requested",
        "Admin action",
        "Policy violation",
        "Suspicious activity",
      ],
    },
    reactivatedAt: {
      type: Date,
    },

    // Tokens
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  },
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ""}`;
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
