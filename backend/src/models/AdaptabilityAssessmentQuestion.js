import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  value: { type: Number, required: true },
  effectiveness: { type: String, enum: ['MOST','MEDIUM', 'LEAST', 'NEUTRAL'], default: 'NEUTRAL' }
}, { _id: false });

const adaptabilityAssessmentQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true, unique: true },
  section: { type: String, required: true, enum: ['SJT', 'Likert'] },
  questionText: { type: String, required: true },
  questionType: { type: String, required: true, enum: ['SJT', 'Likert'] },
  maxScore: { type: Number, required: true },
  isReverseScored: { type: Boolean, default: false },
  options: [optionSchema]
});

const AdaptabilityAssessmentQuestion = mongoose.model('AdaptabilityAssessmentQuestion', adaptabilityAssessmentQuestionSchema);

export default AdaptabilityAssessmentQuestion; 