import mongoose from 'mongoose';

const speakingAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String
  },
  userEmail: {
    type: String
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
  taskId: {
    type: Number
  },
  videoUrl: {
    type: String
  },
  publicId: {
    type: String
  },
  score: {
    type: Number
  },
  overallScore: {
    type: Number,
    default: 70 // Default value to prevent validation errors
  },
  feedback: {
    type: String
  },
  transcribedText: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'evaluated', 'rejected'],
    default: 'pending'
  },
  supervisorId: {
    type: String
  },
  supervisorScore: {
    type: Number
  },
  supervisorFeedback: {
    type: String
  },
  evaluatedAt: {
    type: Date
  },
  criteria: [{
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
  }],
  recommendations: [{
    type: String
  }],
  overallFeedback: {
    type: String
  },
  audioUrl: {
    type: String
  },
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

// Add static method to check if a user can take an assessment
speakingAssessmentSchema.statics.canTakeAssessment = async function(userId, level, language) {
  try {
    // Find the most recent assessment for this user, level, and language
    const recentAssessment = await this.findOne({
      userId,
      level,
      language
    }).sort({ completedAt: -1 }).exec();
    
    // If no assessment found, user can take assessment
    if (!recentAssessment) {
      return {
        available: true,
        message: 'No previous assessment found. You can take this assessment now.',
        nextAvailableDate: null
      };
    }
    
    // Check if cooldown period has passed
    const now = new Date();
    const nextAvailableDate = recentAssessment.nextAvailableDate;
    
    if (now >= nextAvailableDate) {
      return {
        available: true,
        message: 'Cooldown period has passed. You can take this assessment now.',
        nextAvailableDate: null
      };
    }
    
    // User is still in cooldown period
    return {
      available: false,
      message: `You must wait until ${nextAvailableDate.toLocaleDateString()} before taking this assessment again.`,
      nextAvailableDate,
      previousScore: recentAssessment.overallScore,
      previousAssessment: {
        completedAt: recentAssessment.completedAt,
        score: recentAssessment.overallScore,
        feedback: recentAssessment.overallFeedback
      }
    };
  } catch (error) {
    console.error('Error checking assessment availability:', error);
    throw error;
  }
};

// Indexes for efficient querying
speakingAssessmentSchema.index({ userId: 1, level: 1, language: 1 });
speakingAssessmentSchema.index({ userId: 1, completedAt: -1 });

// Use existing model if it exists, otherwise create a new one
const SpeakingAssessment = mongoose.models.SpeakingAssessment || 
  mongoose.model('SpeakingAssessment', speakingAssessmentSchema);

export default SpeakingAssessment; 