/**
 * Script to fix writing assessment scores in the database
 * This script will find all writing assessment records with scores over 100 and divide them by 2
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define WritingAssessment schema
const WritingAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: String, required: true },
  language: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  score: { type: Number, required: true },
  feedback: { type: String },
  criteria: [{
    name: { type: String, required: true },
    score: { type: Number, required: true },
    feedback: { type: String }
  }],
  completedAt: { type: Date, default: Date.now },
  nextAvailableDate: { type: Date }
});

// Create model
const WritingAssessment = mongoose.model('WritingAssessment', WritingAssessmentSchema, 'writingassessments');

// Fix writing assessment scores
const fixWritingScores = async () => {
  try {
    // Find all writing assessments with scores over 100
    const assessments = await WritingAssessment.find({ score: { $gt: 100 } });
    
    console.log(`Found ${assessments.length} writing assessments with scores over 100`);
    
    // Update each assessment
    for (const assessment of assessments) {
      const originalScore = assessment.score;
      assessment.score = Math.round(originalScore / 2);
      
      await assessment.save();
      
      console.log(`Updated assessment ${assessment._id}: ${originalScore} -> ${assessment.score}`);
    }
    
    console.log('All writing assessment scores have been fixed');
  } catch (error) {
    console.error('Error fixing writing assessment scores:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await fixWritingScores();
  process.exit(0);
};

run(); 