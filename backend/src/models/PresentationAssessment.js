import mongoose from 'mongoose';

const PresentationAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'initializing', 'uploading', 'submitted', 'expired', 'graded'],
    default: 'pending'
  },
  videoPath: {
    type: String,
    default: null
  },
  presentationPath: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: null
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PresentationQuestion'
    },
    answer: {
      type: String,
      default: null
    }
  }],
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Add a method to check if the assessment is expired
PresentationAssessmentSchema.methods.isExpired = function() {
  return new Date() > this.deadline;
};

// Add a method to get the remaining time in seconds
PresentationAssessmentSchema.methods.getRemainingTime = function() {
  const now = new Date();
  const deadline = this.deadline;
  
  if (now > deadline) {
    return 0;
  }
  
  return Math.floor((deadline - now) / 1000);
};

// Check if model already exists to prevent OverwriteModelError
let PresentationAssessment;
try {
  PresentationAssessment = mongoose.model('PresentationAssessment');
} catch (e) {
  PresentationAssessment = mongoose.model('PresentationAssessment', PresentationAssessmentSchema);
}

export default PresentationAssessment;
