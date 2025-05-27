import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Convert userId to ObjectId if it's a string
    const userId = typeof decoded.userId === 'string' ? 
      new mongoose.Types.ObjectId(decoded.userId) : 
      decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
}; 

export const isAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }
    
    // Check if user is an admin by email
    const admin = await Admin.findOne({ email: user.email });
    
    if (!admin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    // Attach admin info to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying admin status',
      error: error.message 
    });
  }
};