const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  skills: [String]
}, { _id: true });

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true,
    trim: true
  },
  school: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  gpa: {
    type: String,
    trim: true
  }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  skills: [String],
  url: {
    type: String,
    trim: true
  },
  githubUrl: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  issuer: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  credentialId: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  }
}, { _id: true });

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Information
  profilePhoto: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  
  // Social Links
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String
  },
  
  // Professional Information
  title: {
    type: String,
    trim: true
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  skills: [String],
  
  // Experience and Education
  experience: [experienceSchema],
  education: [educationSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  
  // LinkedIn Import Data
  linkedinData: {
    imported: {
      type: Boolean,
      default: false
    },
    importDate: {
      type: Date
    },
    profileId: String
  },
  
  // Profile Completion
  completionPercentage: {
    type: Number,
    default: 0
  },
  
  // Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  showContactInfo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate completion percentage
profileSchema.methods.calculateCompletion = function() {
  let completed = 0;
  const total = 10;
  
  if (this.profilePhoto) completed++;
  if (this.title) completed++;
  if (this.summary) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  if (this.experience && this.experience.length > 0) completed++;
  if (this.education && this.education.length > 0) completed++;
  if (this.location) completed++;
  if (this.phone) completed++;
  if (this.website) completed++;
  if (this.socialLinks.linkedin || this.socialLinks.github) completed++;
  
  this.completionPercentage = Math.round((completed / total) * 100);
  return this.completionPercentage;
};

module.exports = mongoose.model('Profile', profileSchema);
