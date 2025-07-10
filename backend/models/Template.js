// models/Template.js - MongoDB Schema for Templates
const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: [true, "Template ID is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "Template ID can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      maxLength: [100, "Template name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Template description is required"],
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Template category is required"],
      enum: {
        values: [
          "minimal",
          "creative",
          "professional",
          "developer",
          "executive",
          "modern",
        ],
        message: "Invalid template category",
      },
    },
    features: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    sections: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    colors: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
          },
          message: "Color must be a valid hex color code",
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

module.exports = mongoose.model("Template", templateSchema);
