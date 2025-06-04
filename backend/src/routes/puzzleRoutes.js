import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { startPuzzle, makeMove, getPuzzleState } from '../controllers/puzzleController.js';
import Puzzle from '../models/Puzzle.js';

const router = express.Router();

// Start a new puzzle game
router.post('/start', authenticateToken, startPuzzle);

// Make a move in the puzzle
router.post('/:puzzleId/move', authenticateToken, makeMove);

// Get current puzzle state
router.get('/:puzzleId', authenticateToken, getPuzzleState);

// Update time spent on a puzzle
router.patch('/:puzzleId/time', authenticateToken, async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const { timeSpent } = req.body;
    const puzzle = await Puzzle.findById(puzzleId);
    if (!puzzle) return res.status(404).json({ message: 'Puzzle not found' });
    console.log('DEBUG: PATCH /:puzzleId/time', { puzzleId, received: timeSpent, previous: puzzle.timeSpent });
    puzzle.timeSpent = timeSpent;
    await puzzle.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 