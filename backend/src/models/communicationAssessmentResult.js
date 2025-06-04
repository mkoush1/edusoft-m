import mongoose from 'mongoose';

const communicationAssessmentResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentType: {
    type: String,
    required: true,
    enum: ['leadership', 'puzzle-game', 'fast-questions', 'codeforces', 'communication'],
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Index for efficient querying
communicationAssessmentResultSchema.index({ userId: 1, assessmentType: 1 });

const CommunicationAssessmentResult = mongoose.model('CommunicationAssessmentResult', communicationAssessmentResultSchema);

export default CommunicationAssessmentResult; 