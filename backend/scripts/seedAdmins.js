import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../src/models/Admin.js';

dotenv.config();

const adminUsers = [
  { email: 'admin1@gmail.com', name: 'Abdallah' },
  { email: 'admin2@gmail.com', name: 'Osama' },
  { email: 'admin3@gmail.com', name: 'Mohe' },
  { email: 'admin4@gmail.com', name: 'Mohammed' }
];

const password = 'ammo.1234';

async function seedAdmins() {
  try {
    // Use environment variable for MongoDB connection
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create each admin user
    for (const admin of adminUsers) {
      const existingAdmin = await Admin.findOne({ email: admin.email });
      if (existingAdmin) {
        console.log(`Admin ${admin.email} exists. Verifying password...`);
        
        // Check if password needs updating
        const isPasswordValid = await existingAdmin.comparePassword(password);
        if (!isPasswordValid) {
          console.log(`Updating password for admin ${admin.email}`);
          // Set the plain password - the pre-save hook will hash it
          existingAdmin.password = password;
          await existingAdmin.save();
          console.log(`Password updated for admin ${admin.email}`);
        } else {
          console.log(`Password is already correct for admin ${admin.email}`);
        }
        continue;
      }

      // Create new admin - use plain password, the pre-save hook will hash it
      const newAdmin = new Admin({
        email: admin.email,
        password: password, // Plain password - will be hashed by pre-save hook
        name: admin.name
      });

      await newAdmin.save();
      console.log(`Created admin: ${admin.email}`);
    }

    console.log('Admin seeding completed successfully');
    console.log('\n=== Test Login Credentials ===');
    console.log('Email: admin1@gmail.com');
    console.log('Password: ammo.1234');
    console.log('==============================\n');
    
  } catch (error) {
    console.error('Error seeding admins:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedAdmins();