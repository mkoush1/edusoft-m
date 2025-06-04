import mongoose from 'mongoose';

const speakingAssessmentQuestionSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['english', 'french', 'arabic'],
    default: 'english'
  },
  level: {
    type: String,
    required: true,
    enum: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'],
    default: 'b1'
  },
  taskId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  preparationTime: {
    type: Number,
    required: true,
    default: 60 // seconds
  },
  speakingTime: {
    type: Number,
    required: true,
    default: 120 // seconds
  },
  criteria: [{
    type: String
  }],
  sampleAnswer: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for unique tasks per level and language
speakingAssessmentQuestionSchema.index({ language: 1, level: 1, taskId: 1 }, { unique: true });

const SpeakingAssessmentQuestion = mongoose.model('SpeakingAssessmentQuestion', speakingAssessmentQuestionSchema);

export default SpeakingAssessmentQuestion; 