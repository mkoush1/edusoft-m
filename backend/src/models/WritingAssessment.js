import mongoose from 'mongoose';

const writingAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']
  },
  language: {
    type: String,
    required: true,
    enum: ['english', 'french']
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  feedback: {
    type: String
  },
  criteria: [
    {
      name: {
        type: String,
        required: true
      },
      score: {
        type: Number,
        required: true
      },
      feedback: {
        type: String
      }
    }
  ],
  completedAt: {
    type: Date,
    default: Date.now
  },
  nextAvailableDate: {
    type: Date,
    default: function() {
      // Set next available date to 7 days after completion
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 7);
      return nextDate;
    }
  }
}, { timestamps: true });

// Indexes for efficient querying
writingAssessmentSchema.index({ userId: 1, level: 1, language: 1 });
writingAssessmentSchema.index({ userId: 1, completedAt: -1 });

const WritingAssessment = mongoose.model('WritingAssessment', writingAssessmentSchema);

export default WritingAssessment; 