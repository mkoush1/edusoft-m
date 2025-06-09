import mongoose from 'mongoose';
import { LeetCode } from 'leetcode-query';

const leetCodeAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for better query performance
  },
  leetCodeUsername: {
    type: String,
    required: true,
    trim: true,
    maxlength: 15
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
    problemId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    titleSlug: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
    default: 'not_started',
    index: true // Add index for better query performance
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add compound index for better query performance

async function hasSolvedProblem(username, problemSlug) {
  try {
    const leetcode = new LeetCode();
    // Get the last 20 submissions
    const submissions = await leetcode.submissions({ username, limit: 20 });
    if (!submissions || !Array.isArray(submissions)) {
      console.log('No data or invalid data from leetcode-query');
      return false;
    }
    // Check if any accepted submission matches the problem slug
    const solved = submissions.some(
      sub => sub.titleSlug === problemSlug && sub.statusDisplay === 'Accepted'
    );
    console.log(`[leetcode-query] User ${username} solved ${problemSlug}?`, solved);
    return solved;
  } catch (error) {
    console.error('Error using leetcode-query:', error.message);
    return false;
  }
}

// Use existing model if it exists, otherwise create a new one
const LeetCodeAssessment = mongoose.models.LeetCodeAssessment || 
  mongoose.model('LeetCodeAssessment', leetCodeAssessmentSchema);

export default LeetCodeAssessment;