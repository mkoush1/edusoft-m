import mongoose from 'mongoose';

const problemSolvingQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true, unique: true },
  section: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{
    letter: { type: String, required: true },
    text: { type: String, required: true }
  }],
  correctAnswer: { type: String, required: true },
  timeLimit: { type: Number, required: true },
  dimension: { type: String, required: true },
  frameworkAlignment: { type: String, required: true },
  cognitiveProcess: { type: String, required: true }
}, { timestamps: true });

const ProblemSolvingQuestion = mongoose.model(
  'ProblemSolvingQuestion',
  problemSolvingQuestionSchema
);

export default ProblemSolvingQuestion; 