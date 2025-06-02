import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PresentationSubmission from '../models/PresentationSubmission.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Migrate criteria scores to new field names
const migrateCriteriaScores = async () => {
  try {
    // Find all submissions that have criteria scores
    const submissions = await PresentationSubmission.find({
      $or: [
        { 'criteriaScores.engagementDelivery': { $exists: true } },
        { 'criteriaScores.impactEffectiveness': { $exists: true } }
      ]
    });

    console.log(`Found ${submissions.length} submissions with old criteria score field names`);

    // Update each submission
    for (const submission of submissions) {
      console.log(`Processing submission ${submission._id}`);
      
      // Get the current criteria scores
      const oldScores = submission.criteriaScores || {};
      console.log('Old scores:', JSON.stringify(oldScores));
      
      // Use direct MongoDB update to bypass Mongoose validation
      await PresentationSubmission.updateOne(
        { _id: submission._id },
        { $set: {
            'criteriaScores.contentClarity': oldScores.contentClarity || 0,
            'criteriaScores.engagement': oldScores.engagementDelivery || oldScores.engagement || 0,
            'criteriaScores.impact': oldScores.impactEffectiveness || oldScores.impact || 0
          }
        }
      );
      
      // Verify the update
      const updatedSubmission = await PresentationSubmission.findById(submission._id);
      console.log('Updated scores:', JSON.stringify(updatedSubmission.criteriaScores));
      console.log(`Updated submission ${submission._id}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// Main function
const main = async () => {
  const conn = await connectDB();
  await migrateCriteriaScores();
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
};

// Run the migration
main();
