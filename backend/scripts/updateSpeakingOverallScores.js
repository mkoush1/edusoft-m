// updateSpeakingOverallScores.js
// Run this script with: node backend/scripts/updateSpeakingOverallScores.js

import mongoose from 'mongoose';
import SpeakingAssessment from '../models/SpeakingAssessment.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/edusoft';

async function updateOverallScores() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const assessments = await SpeakingAssessment.find({});
  console.log(`Found ${assessments.length} assessments`);
  let updatedCount = 0;

  for (const assessment of assessments) {
    console.log('Assessment ID:', assessment._id);
    if (assessment.supervisorFeedback) {
      try {
        const feedback = JSON.parse(assessment.supervisorFeedback);
        console.log(`Assessment ${assessment._id}: supervisorFeedback.rawScore =`, feedback.rawScore);
        if (feedback.rawScore !== undefined) {
          if (assessment.overallScore !== feedback.rawScore) {
            assessment.overallScore = feedback.rawScore;
            await assessment.save();
            updatedCount++;
            console.log(`--> Updated overallScore to ${feedback.rawScore}`);
          } else {
            console.log('--> overallScore already correct, skipping');
          }
        } else {
          console.log('--> No rawScore in supervisorFeedback');
        }
      } catch (e) {
        console.log(`Assessment ${assessment._id}: Error parsing supervisorFeedback`);
      }
    } else {
      console.log(`Assessment ${assessment._id}: No supervisorFeedback`);
    }
  }

  console.log(`Done. Updated ${updatedCount} assessments.`);
  await mongoose.disconnect();
}

updateOverallScores().catch(err => {
  console.error('Error updating overall scores:', err);
  process.exit(1);
}); 