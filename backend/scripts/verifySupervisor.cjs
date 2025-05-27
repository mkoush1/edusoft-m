// Usage: node backend/scripts/verifySupervisor.cjs
// Set the email address below before running

const mongoose = require('mongoose');
const Supervisor = require('../src/models/supervisor.model.js');

// === CONFIGURE THIS EMAIL ===
const EMAIL_TO_VERIFY = 'osamaahmad4923@gmail.com';

// === Optionally, set your MongoDB URI here or use your app's env ===
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@edusoft-cluster.way6fkv.mongodb.net/edusoft?retryWrites=true&w=majority&appName=EduSoft-Cluster';

async function verifySupervisor() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const result = await Supervisor.updateOne(
      { Email: EMAIL_TO_VERIFY },
      { $set: { isEmailVerified: true }, $unset: { emailVerificationToken: '', emailVerificationExpires: '' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Supervisor with email ${EMAIL_TO_VERIFY} is now verified.`);
    } else {
      console.log(`No supervisor found with email ${EMAIL_TO_VERIFY}, or already verified.`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error verifying supervisor:', err);
    process.exit(1);
  }
}

verifySupervisor(); 