import jwt from 'jsonwebtoken';
import { verifyToken } from '../routes/auth.js';

export const authenticateToken = async (req, res, next) => {
  try {
    await verifyToken(req, res, next);
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};
