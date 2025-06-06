const templateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['minimal', 'creative', 'professional', 'developer'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: [String],
  sections: [String],
  preview: String, // URL to preview image
  isPremium: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  downloads: {
    type: String,
    default: '0'
  },
  colors: [String], // Hex color codes
  tags: [String],
  componentPath: String, // Path to React component
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Template = mongoose.model('Template', templateSchema);