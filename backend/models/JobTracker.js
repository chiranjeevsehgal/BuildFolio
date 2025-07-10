const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Basic Job Information
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxLength: [200, "Job title cannot exceed 200 characters"],
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxLength: [100, "Company name cannot exceed 100 characters"],
      index: true,
    },

    location: {
      type: String,
      trim: true,
      maxLength: [100, "Location cannot exceed 100 characters"],
    },

    salary: {
      type: String,
      trim: true,
      maxLength: [50, "Salary cannot exceed 50 characters"],
    },

    // Job Status and Priority
    status: {
      type: String,
      enum: ["applied", "interview", "in-progress", "offer", "rejected"],
      default: "applied",
      required: true,
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },

    // Job Details
    jobUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty URLs
          return /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid URL starting with http:// or https://",
      },
    },

    description: {
      type: String,
      trim: true,
      maxLength: [5000, "Description cannot exceed 5000 characters"],
    },

    // Application Date
    appliedDate: {
      type: Date,
      required: [true, "Application date is required"],
      default: Date.now,
    },

    // Contact Information
    recruiterName: {
      type: String,
      trim: true,
      maxLength: [100, "Recruiter name cannot exceed 100 characters"],
    },

    contactEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty emails
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },

    contactPhone: {
      type: String,
      trim: true,
      maxLength: [20, "Phone number cannot exceed 20 characters"],
    },

    // Personal Notes
    notes: {
      type: String,
      trim: true,
      maxLength: [2000, "Notes cannot exceed 2000 characters"],
    },

    // AI Features (current frontend usage)
    aiSuggestions: [
      {
        type: String,
        maxLength: [500, "AI suggestion cannot exceed 500 characters"],
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// Indexes for better query performance
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, company: 1 });
jobSchema.index({ userId: 1, appliedDate: -1 });
jobSchema.index({ userId: 1, title: "text", company: "text" }); // Text search

// Virtual field for days since applied
jobSchema.virtual("daysSinceApplied").get(function () {
  if (!this.appliedDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.appliedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Middleware to track status changes in updatedAt
jobSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.updatedAt = new Date();
  }
  next();
});

// Static methods for common queries
jobSchema.statics.getByStatus = function (userId, status) {
  return this.find({ userId, status });
};

jobSchema.statics.searchJobs = function (userId, searchTerm) {
  return this.find({
    userId,
    $or: [
      { title: { $regex: searchTerm, $options: "i" } },
      { company: { $regex: searchTerm, $options: "i" } },
      { location: { $regex: searchTerm, $options: "i" } },
    ],
  });
};

jobSchema.statics.getJobStats = function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
