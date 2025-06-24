const mongoose = require('mongoose');

const portfolioDeploymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  templateId: {
    type: String,
    required: true,
    enum: ['modern-professional', 'minimal-clean', 'creative-gradient', 'terminal-developer-focused', 'executive-suite'],
  },
  customDomain: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'modified', 'error', "deactivated"],
    default: 'active',
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  userData: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: false, default: '' },
    email: { type: String, required: true },
    username: String,
    profilePhoto: String,
    personalInfo: {
      phone: String,
      location: String,
      website: String,
      socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
        portfolio: String,
        behance: String,
        dribbble: String,
        twitter: String,
        other: String,
      }
    },
    professional: {
      title: String,
      summary: String,
      skills: [String]
    },
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String,
      achievements: [String]
    }],
    education: [{
      degree: String,
      school: String,
      location: String,
      startDate: String,
      endDate: String,
      description: String,
      gpa: String
    }],
    projects: [{
      title: String,
      description: String,
      skills: [String],
      url: String,
      githubUrl: String,
      image: String,
      featured: Boolean
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: String,
      expiryDate: String,
      credentialUrl: String,
      badge: String
    }]
  },
  seoData: {
    title: String,
    description: String,
    keywords: String,
    ogImage: String
  },
  views: {
    type: Number,
    default: 0
  },

  // Timestamps

  lastViewedAt: {
    type: Date,
    default: null
  },
  deployedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deactivatedAt: {
    type: Date
  },
  reactivatedAt: {
    type: Date
  },

  // Reasons
  modificationReason: {
    type: String
  },
  deactivationReason: {
    type: String
  },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for portfolio URL
portfolioDeploymentSchema.virtual('portfolioUrl').get(function () {
  return `${process.env.FRONTEND_URL}/${this.username}`;
});

// Middleware to update updatedAt on save
portfolioDeploymentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PortfolioDeployment', portfolioDeploymentSchema);
