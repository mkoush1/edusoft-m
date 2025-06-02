import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import PresentationSubmission from '../src/models/PresentationSubmission.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateUsernames() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all submissions without a username
        const submissions = await PresentationSubmission.find({ username: { $exists: false } });
        console.log(`Found ${submissions.length} submissions to update`);

        let updatedCount = 0;
        
        for (const submission of submissions) {
            try {
                const user = await User.findById(submission.userId).select('username').lean();
                if (user?.username) {
                    await PresentationSubmission.updateOne(
                        { _id: submission._id },
                        { $set: { username: user.username } }
                    );
                    updatedCount++;
                    console.log(`Updated submission ${submission._id} with username: ${user.username}`);
                } else {
                    console.log(`No username found for user ${submission.userId}, using 'Unknown User'`);
                    await PresentationSubmission.updateOne(
                        { _id: submission._id },
                        { $set: { username: 'Unknown User' } }
                    );
                    updatedCount++;
                }
            } catch (error) {
                console.error(`Error processing submission ${submission._id}:`, error);
            }
        }

        console.log(`\nMigration complete. Updated ${updatedCount} submissions.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
migrateUsernames();
