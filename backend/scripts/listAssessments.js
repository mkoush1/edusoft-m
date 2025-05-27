import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assessment from '../src/models/Assessment.js';

dotenv.config();

const listAssessments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    
    const assessments = await Assessment.find({});
    console.log('Found assessments:', assessments);
    
    if (assessments.length === 0) {
      console.log('No assessments found in the database.');
    } else {
      console.log('Assessments in database:');
      assessments.forEach(assessment => {
        console.log(`- ${assessment.title} (${assessment.category})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listAssessments();
