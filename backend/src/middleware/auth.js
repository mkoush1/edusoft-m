import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Supervisor from '../models/supervisor.model.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Convert userId to ObjectId if it's a string
      const userId = typeof decoded.userId === 'string' ? 
        new mongoose.Types.ObjectId(decoded.userId) : 
        decoded.userId;

      let user;
      if (decoded.role === 'supervisor') {
        user = await Supervisor.findById(userId);
      } else if (decoded.role === 'admin') {
        user = await Admin.findById(userId);
      } else {
        user = await User.findById(userId);
      }

      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      req.user = user;
      req.userId = user._id;
      req.userRole = decoded.role;
      console.log('Token decoded successfully:', decoded);
      next();
    } catch (jwtError) {
      console.log('Token verification failed:', jwtError.message);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          success: false,
          message: 'Invalid token' 
        });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(403).json({ 
          success: false,
          message: 'Token expired' 
        });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Authentication error',
      error: error.message 
    });
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
    console.log('Checking admin role for user:', user);
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