import mongoose from 'mongoose';

const leetCodeAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leetCodeUsername: {
    type: String,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  verificationMethod: {
    type: String,
    enum: ['bio', 'problem'],
    required: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  assignedProblems: [{
    problemId: String,
    title: String,
    difficulty: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  score: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  }
});

export default mongoose.model('LeetCodeAssessment', leetCodeAssessmentSchema);
