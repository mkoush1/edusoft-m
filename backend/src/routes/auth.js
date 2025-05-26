import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Supervisor from '../models/supervisor.model.js';
import Admin from '../models/Admin.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Middleware to verify JWT token and role
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    // Get user data based on role
    let userData;
    if (req.userRole === 'admin') {
      userData = await Admin.findById(req.userId).select('-password');
    } else if (req.userRole === 'supervisor') {
      userData = await Supervisor.findById(req.userId).select('-Password');
    } else {
      userData = await User.findById(req.userId).select('-password');
    }

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.userData = userData;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get current user route
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userResponse = {
      id: req.userData._id,
      name: req.userData.name || req.userData.Username,
      email: req.userData.email || req.userData.Email,
      role: req.userRole
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ 
      message: 'Error fetching user', 
      error: error.message,
      details: 'An error occurred while fetching user information'
    });
  }
});

// User Signup
router.post('/user/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('User signup attempt:', email);

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          password: !password ? 'Password is required' : undefined
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format',
        field: 'email'
      });
    }

    // If role is instructor, create in Supervisor collection
    if (role === 'instructor') {
      // Check if supervisor exists
      const existingSupervisor = await Supervisor.findOne({ Email: email.toLowerCase() });
      if (existingSupervisor) {
        return res.status(400).json({ message: 'Instructor already exists' });
      }

      // Create new supervisor
      const newSupervisor = new Supervisor({
        Username: name.trim(),
        Email: email.toLowerCase().trim(),
        Password: password
      });

      await newSupervisor.save();
      console.log('New instructor created:', newSupervisor.Email);

      // Generate JWT token
      const token = jwt.sign(
        { userId: newSupervisor._id, role: 'supervisor' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: 'Instructor created successfully',
        token,
        user: {
          id: newSupervisor._id,
          name: newSupervisor.Username,
          email: newSupervisor.Email,
          role: 'supervisor'
        }
      });
    }

    // For non-instructor roles, create in User collection
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      softSkillScore: 0,
      progress: 0,
      userId: Math.floor(100000 + Math.random() * 900000)
    });

    // Validate the user document before saving
    const validationError = newUser.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    await newUser.save();
    console.log('New user created:', newUser.email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message
    });
  }
});

// Supervisor Signup
router.post('/supervisor/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    console.log('Supervisor signup attempt:', email);

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          fullName: !fullName ? 'Full name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          password: !password ? 'Password is required' : undefined
        }
      });
    }

    // Check if supervisor exists
    const existingSupervisor = await Supervisor.findOne({ Email: email.toLowerCase() });
    if (existingSupervisor) {
      return res.status(400).json({ 
        message: 'Supervisor already exists',
        details: 'An account with this email already exists'
      });
    }

    // Create new supervisor with auto-generated IDs
    const newSupervisor = new Supervisor({
      Username: fullName.trim(),
      Email: email.toLowerCase().trim(),
      Password: password,
      UserID: Math.floor(100000 + Math.random() * 900000),
      supervisorId: Math.floor(100000 + Math.random() * 900000)
    });

    await newSupervisor.save();
    console.log('New supervisor created:', newSupervisor.Email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newSupervisor._id, role: 'supervisor' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Supervisor created successfully',
      token,
      supervisor: {
        id: newSupervisor._id,
        fullName: newSupervisor.Username,
        email: newSupervisor.Email,
        role: 'supervisor'
      }
    });
  } catch (error) {
    console.error('Supervisor signup error:', error);
    res.status(500).json({ 
      message: 'Error creating supervisor', 
      error: error.message
    });
  }
});

// Admin Login - Enhanced version with better debugging
router.post('/admin/login', async (req, res) => {
  try {
    console.log('\n=== Admin Login Attempt ===');
    console.log('Headers:', req.headers);
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: !!email, password: !!password }
      });
    }

    console.log('Login attempt for email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');

    // Find admin by email (case-insensitive)
    const admin = await Admin.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password');
    
    if (!admin) {
      console.log('Admin not found for email:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials', 
        error: 'Admin not found' 
      });
    }

    console.log('Found admin:', {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      hasPassword: !!admin.password,
      passwordLength: admin.password ? admin.password.length : 0
    });

    // Verify password using the admin's comparePassword method
    const isValidPassword = await admin.comparePassword(password);
    console.log('Final password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Password mismatch for admin:', admin.email);
      return res.status(401).json({ 
        message: 'Invalid credentials', 
        error: 'Password mismatch' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin._id, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for admin:', admin.email);
    console.log('Generated token:', token ? 'Yes' : 'No');

    // Format response
    const adminResponse = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin'
    };

    res.json({ 
      token, 
      user: adminResponse,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
});

// User Login
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n=== User Login Attempt ===');
    console.log('Email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });

    const isMatch = await user.matchPassword(password);
    console.log('Final password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role || 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', email);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student'
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message
    });
  }
});

// Supervisor Login
router.post('/supervisor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Supervisor login attempt:', email);

    // Find supervisor by email (case-insensitive)
    const supervisor = await Supervisor.findOne({ 
      Email: { $regex: new RegExp(email, 'i') } 
    });
    
    console.log('Supervisor lookup result:', supervisor ? 'Found' : 'Not found');
    
    if (!supervisor) {
      console.log('Supervisor not found for email:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    console.log('Supervisor found:', {
      id: supervisor._id,
      email: supervisor.Email,
      username: supervisor.Username,
      hasPassword: !!supervisor.Password,
      passwordLength: supervisor.Password ? supervisor.Password.length : 0
    });

    const isMatch = await supervisor.comparePassword(password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for supervisor:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    const token = jwt.sign(
      { userId: supervisor._id, role: 'supervisor' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for supervisor:', email);

    res.json({
      token,
      user: {
        id: supervisor._id,
        fullName: supervisor.Username,
        email: supervisor.Email,
        role: 'supervisor'
      }
    });
  } catch (error) {
    console.error('Supervisor login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message
    });
  }
});

// User Forgot Password
router.post('/user/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    // Redirect to unified forgot password route
    res.redirect(307, '/auth/forgot-password', { body: { email, userType: 'user' } });
  } catch (error) {
    console.error('User forgot password error:', error);
    res.status(500).json({ 
      message: 'Error sending reset email',
      details: 'An error occurred while processing your request'
    });
  }
});

// Supervisor Forgot Password
router.post('/supervisor/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    // Redirect to unified forgot password route
    res.redirect(307, '/auth/forgot-password', { body: { email, userType: 'supervisor' } });
  } catch (error) {
    console.error('Supervisor forgot password error:', error);
    res.status(500).json({ 
      message: 'Error sending reset email',
      details: 'An error occurred while processing your request'
    });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, userType } = req.body;
    console.log('Forgot password request for:', { email, userType });

    // Find user by email and userType
    const UserModel = userType === 'supervisor' ? Supervisor : User;
    const emailField = userType === 'supervisor' ? 'Email' : 'email';
    
    // Create query object dynamically
    const query = {};
    query[emailField] = email.toLowerCase();
    
    const user = await UserModel.findOne(query);
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        details: 'No account found with this email address'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated reset token:', resetToken);

    // Update user with reset token
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log('Reset token saved for user');

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}&type=${userType}`;
    
    // In development, return the reset URL
    if (process.env.NODE_ENV === 'development') {
      console.log('\n\n');
      console.log('==================================================');
      console.log('🚀 PASSWORD RESET LINK (COPY THIS URL):');
      console.log('==================================================');
      console.log(resetUrl);
      console.log('==================================================');
      console.log('📧 Email:', email);
      console.log('👤 User Type:', userType);
      console.log('==================================================\n\n');
      
      return res.status(200).json({
        message: 'Password reset email sent',
        details: 'Please check your email for password reset instructions',
        resetUrl: resetUrl // Include the reset URL in the response
      });
    }

    await sendPasswordResetEmail(email, resetToken, userType);
    res.status(200).json({
      message: 'Password reset email sent',
      details: 'Please check your email for password reset instructions'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, userType } = req.body;
    console.log('Reset password request received:', { hasToken: !!token, hasPassword: !!password, userType });

    if (!token || !password) {
      console.log('Missing required fields:', { hasToken: !!token, hasPassword: !!password });
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Find user by token and userType
    const UserModel = userType === 'supervisor' ? Supervisor : User;
    console.log('Looking for user with token:', token);

    // Create query object for finding user
    const query = {
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    };

    const user = await UserModel.findOne(query);
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with token:', token);
      // Check if token exists but is expired
      const expiredUser = await UserModel.findOne({ resetToken: token });
      if (expiredUser) {
        console.log('Token exists but is expired');
        return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
      }
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    console.log('User found, resetting password');
    // Handle different password field names for User and Supervisor
    if (userType === 'supervisor') {
      user.Password = password;
    } else {
      user.password = password;
    }
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    console.log('Password reset successful');

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

export default router; 