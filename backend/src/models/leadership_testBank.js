import mongoose from 'mongoose';

const leadershipQuestionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  competency: {
    type: String,
    required: true,
    enum: ['Vision', 'Ethics', 'Communication', 'Team Management', 'Decision Making', 'Emotional Intelligence', 'Adaptability', 'Innovation', 'Development']
  },
  options: [{
    letter: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D']
    },
    text: {
      type: String,
      required: true
    }
  }],
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  reasoning: {
    type: String,
    required: true
  }
});

const LeadershipQuestion = mongoose.model('LeadershipQuestion', leadershipQuestionSchema);

export default LeadershipQuestion; 