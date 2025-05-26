import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Assessment from '../src/models/assessment.js';

dotenv.config();

const assessments = [
  {
    title: 'Leadership Skill Assessment',
    description: 'Evaluate your leadership abilities and identify areas for improvement.',
    image: '/leadership.jpg',
    category: 'leadership',
    duration: 30
  },
  {
    title: 'Problem Solving Skill Assessment',
    description: 'Test your ability to analyze situations and develop effective solutions.',
    image: '/problem-solving.jpg',
    category: 'problem-solving',
    duration: 45
  },
  {
    title: 'Presentation Skill Assessment',
    description: 'Assess your public speaking and presentation capabilities.',
    image: '/presentation.jpg',
    category: 'presentation',
    duration: 30
  },
  {
    title: 'Team Work Skill Assessment',
    description: 'Evaluate your ability to collaborate and work effectively in a team.',
    image: '/teamwork.jpg',
    category: 'teamwork',
    duration: 40
  },
  {
    title: 'Adaptability and Flexibility Skill Assessment',
    description: 'Measure your capacity to adapt to changing circumstances and environments.',
    image: '/adaptability.jpg',
    category: 'adaptability',
    duration: 35
  },
  {
    title: 'Communication Skill Assessment',
    description: 'Assess your verbal and written communication effectiveness.',
    image: '/communication.jpg',
    category: 'communication',
    duration: 40
  }
];

async function seedAssessments() {
  try {
    // Connect to MongoDB with explicit options
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
        socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
        connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
      }
    );

    // Wait for the connection to be established
    await new Promise((resolve, reject) => {
      mongoose.connection.once('open', () => {
        console.log('Connected to MongoDB');
        resolve();
      });
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        reject(err);
      });
    });

    // Check for existing assessments
    const existingCount = await Assessment.countDocuments();
    console.log(`Found ${existingCount} existing assessments`);

    if (existingCount === 0) {
      // Insert all assessments
      await Assessment.insertMany(assessments);
      console.log('All assessments seeded successfully');
    } else {
      // Update existing assessments and add missing ones
      for (const assessment of assessments) {
        const existing = await Assessment.findOne({ category: assessment.category });
        
        if (existing) {
          console.log(`Updating assessment: ${assessment.title}`);
          await Assessment.findByIdAndUpdate(existing._id, assessment);
        } else {
          console.log(`Creating new assessment: ${assessment.title}`);
          await Assessment.create(assessment);
        }
      }
      console.log('Assessments updated successfully');
    }
  } catch (error) {
    console.error('Error seeding assessments:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seedAssessments();
