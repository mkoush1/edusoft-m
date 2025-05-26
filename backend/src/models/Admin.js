import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Hashing password in pre-save hook...');
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Generated password hash:', this.password);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing password:', candidatePassword);
    console.log('With stored hash:', this.password);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Comparison result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;