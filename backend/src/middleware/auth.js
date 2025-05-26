import jwt from 'jsonwebtoken';
import User from '../models/user.js';
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