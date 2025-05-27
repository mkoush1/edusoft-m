import mongoose from 'mongoose';

const presentationQuestionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  preparationTime: {
    type: Number,
    required: true,
    default: 120 // 2 minutes
  },
  recordingTime: {
    type: Number,
    required: true,
    default: 120 // 2 minutes
  }
}, {
  timestamps: true
});

const PresentationQuestion = mongoose.model('PresentationQuestion', presentationQuestionSchema);

export default PresentationQuestion;
