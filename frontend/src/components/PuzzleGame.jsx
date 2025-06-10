import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PuzzleGame = ({ initialPuzzle, assessmentId }) => {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState(initialPuzzle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(240); // 4 minutes
  const [timerInterval, setTimerInterval] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [savedState, setSavedState] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreMessage, setScoreMessage] = useState('');
  const [canRetake, setCanRetake] = useState(false);
  const [retakeMessage, setRetakeMessage] = useState("");

  useEffect(() => {
    // Use the correct initial value based on timeSpent
    const initialTime = initialPuzzle && typeof initialPuzzle.timeSpent === 'number'
      ? 240 - initialPuzzle.timeSpent
      : 240;
    startTimer(initialTime);
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  // Check if time is up
  useEffect(() => {
    if (timer <= 0 && !isPaused) {
      handleTimeUp();
    }
  }, [timer]);

  const calculateScore = (timeSpentSeconds, moves) => {
    // Max score is 100
    // Deduct points for more moves and more time, but always give at least 10 for solving
    const maxMoves = 50;
    const maxTime = 240; // 4 minutes

    // Calculate move penalty (up to 30 points)
    const movePenalty = Math.min(30, Math.max(0, ((moves - 20) * 1)));
    // Calculate time penalty (up to 60 points)
    const timePenalty = Math.min(60, Math.max(0, ((timeSpentSeconds - 60) * 0.5)));

    let score = 100 - movePenalty - timePenalty;
    score = Math.max(10, Math.round(score)); // Always give at least 10 for solving

    // Set score message
    if (score >= 90) {
      setScoreMessage("Excellent! Perfect score! You're a puzzle master!");
    } else if (score >= 75) {
      setScoreMessage("Very good! You're really good at this!");
    } else if (score >= 60) {
      setScoreMessage("Good job! You can do even better next time!");
    } else {
      setScoreMessage("Keep practicing! You can improve your score!");
    }

    return score;
  };

  const handleTimeUp = async () => {
    clearInterval(timerInterval);
    setIsTimeUp(true);
    const timeSpent = 240 - timer;
    console.log('DEBUG: [handleTimeUp] timeSpent:', timeSpent, 'moves:', puzzle.moves);
    const finalScore = calculateScore(timeSpent, puzzle.moves);
    console.log('DEBUG: [handleTimeUp] finalScore:', finalScore);
    setScore(finalScore);
    // Submit the assessment with the current state
    await submitAssessment({
      ...puzzle,
      isCompleted: true,
      timeUp: true,
      score: finalScore
    });
  };

  const startTimer = (initial = timer) => {
    if (timerInterval) clearInterval(timerInterval);
    setTimer(initial);
    const interval = setInterval(() => {
      if (!isPaused) {
        setTimer(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    setTimerInterval(interval);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Update valid moves whenever puzzle state changes
  useEffect(() => {
    if (!puzzle) return;

    const currentState = puzzle.currentState;
    const size = puzzle.size;
    let emptyRow, emptyCol;
    const newValidMoves = [];

    // Find empty cell (0)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (currentState[i][j] === 0) {
          emptyRow = i;
          emptyCol = j;
          break;
        }
      }
    }

    // Find valid moves (adjacent to empty cell)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (Math.abs(i - emptyRow) + Math.abs(j - emptyCol) === 1) {
          newValidMoves.push(`${i},${j}`);
        }
      }
    }

    setValidMoves(newValidMoves);
  }, [puzzle]);

  const saveTimeSpent = async (timeSpent) => {
    console.log('DEBUG: Saving timeSpent to backend:', timeSpent);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/puzzle/${puzzle._id}/time`,
        { timeSpent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (err) {
      console.error('Failed to save timeSpent:', err);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setSavedState(null);
    } else {
      setIsPaused(true);
      setSavedState({
        currentState: puzzle.currentState,
        moves: puzzle.moves,
        time: timer
      });
      // Save time spent to backend
      saveTimeSpent(240 - timer);
    }
  };

  const makeMove = async (row, col) => {
    if (!puzzle || puzzle.isCompleted || isPaused || isTimeUp) return;
    
    // Don't allow clicking on the empty cell
    if (puzzle.currentState[row][col] === 0) {
      console.log('Clicked on empty cell');
      return;
    }

    // Check if move is valid
    if (!validMoves.includes(`${row},${col}`)) {
      // Instead of showing error, just ignore invalid moves
      console.log('Invalid move ignored');
      return;
    }

    console.log('Attempting move:', { row, col });
    console.log('Current puzzle state:', puzzle.currentState);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/puzzle/${puzzle._id}/move`,
        { row, col },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Move successful:', response.data);
      setPuzzle(response.data);
      setError(null);

      if (response.data.isCompleted) {
        clearInterval(timerInterval);
        await submitAssessment(response.data);
      }
    } catch (error) {
      console.error('Error making move:', error);
      // Don't show error message for invalid moves
      if (error.response?.status !== 400) {
        setError(error.response?.data?.message || 'Failed to make move');
      }
    }
  };

  // Add token validation function
  const validateToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      navigate('/login');
      return false;
    }

    // Check if token is expired
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.exp * 1000 < Date.now()) {
        setError('Session expired. Please log in again.');
        navigate('/login');
        return false;
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setError('Invalid session. Please log in again.');
      navigate('/login');
      return false;
    }

    return true;
  };

  // Add token refresh function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('http://localhost:5000/api/auth/refresh-token', {
        refreshToken
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Modify submitAssessment function with better error handling
  const submitAssessment = async (completedPuzzle) => {
    if (!validateToken()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const timeSpent = 240 - timer;
      console.log('DEBUG: [submitAssessment] timeSpent:', timeSpent, 'moves:', completedPuzzle.moves);
      const finalScore = calculateScore(timeSpent, completedPuzzle.moves);
      console.log('DEBUG: [submitAssessment] finalScore:', finalScore);
      setScore(finalScore);

      // Validate puzzle data before submission
      if (!completedPuzzle._id || typeof completedPuzzle.moves !== 'number' || typeof (240 - timer) !== 'number') {
        throw new Error('Invalid puzzle data for submission');
      }

      const puzzleData = {
        puzzleId: completedPuzzle._id,
        difficulty: 'medium',
        moves: completedPuzzle.moves,
        timeTaken: 240 - timer,
        completed: true,
        score: finalScore
      };

      // Validate the data structure
      if (!puzzleData.puzzleId || typeof puzzleData.moves !== 'number' || 
          typeof puzzleData.timeTaken !== 'number' || typeof puzzleData.score !== 'number') {
        throw new Error('Invalid puzzle data structure');
      }

      const response = await axios.post(
        'http://localhost:5000/api/assessments/submit/puzzle-game',
        { puzzleData: [puzzleData] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Update local storage with the new assessment status
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData) {
          userData.completedAssessments = response.data.result.assessmentStatus.completedAssessments;
          userData.totalAssessmentsCompleted = response.data.result.assessmentStatus.totalCompleted;
          userData.progress = response.data.result.assessmentStatus.progress;
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        // Show success message
        setError(null);
        setPuzzle(prev => ({
          ...prev,
          isCompleted: true,
          showWinMessage: true
        }));
      } else {
        throw new Error(response.data.message || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      
      // Handle specific error cases
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Token expired, try to refresh
            const refreshed = await refreshToken();
            if (refreshed) {
              // Retry submission with new token
              return submitAssessment(completedPuzzle);
            }
            setError('Session expired. Please log in again.');
            navigate('/login');
            break;
          case 403:
            setError('You do not have permission to submit this assessment.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(error.response.data?.message || 'Failed to submit assessment');
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(error.message || 'Failed to submit assessment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (!puzzle || puzzle.isCompleted) return;

    const currentState = puzzle.currentState;
    const size = puzzle.size;
    let emptyRow, emptyCol;

    // Find empty cell (0)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (currentState[i][j] === 0) {
          emptyRow = i;
          emptyCol = j;
          break;
        }
      }
    }

    switch (e.key) {
      case 'ArrowUp':
        if (emptyRow < size - 1) makeMove(emptyRow + 1, emptyCol);
        break;
      case 'ArrowDown':
        if (emptyRow > 0) makeMove(emptyRow - 1, emptyCol);
        break;
      case 'ArrowLeft':
        if (emptyCol < size - 1) makeMove(emptyRow, emptyCol + 1);
        break;
      case 'ArrowRight':
        if (emptyCol > 0) makeMove(emptyRow, emptyCol - 1);
        break;
      default:
        break;
    }
  }, [puzzle]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Save timeSpent on unmount
  useEffect(() => {
    return () => {
      if (!puzzle?.isCompleted && !isTimeUp) {
        saveTimeSpent(240 - timer);
      }
    };
    // eslint-disable-next-line
  }, []);

  // Modify the useEffect for fetching retake eligibility
  useEffect(() => {
    if (puzzle?.isCompleted || isTimeUp) {
      const checkRetake = async () => {
        if (!validateToken()) return;

        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/api/assessments/puzzle-game/user/me/results', {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (res.data) {
            setCanRetake(res.data.canRetake !== undefined ? res.data.canRetake : false);
            setRetakeMessage(res.data.retakeMessage || "");
          }
        } catch (error) {
          console.error('Error checking retake eligibility:', error);
          
          if (error.response?.status === 401 || error.response?.status === 403) {
            const refreshed = await refreshToken();
            if (refreshed) {
              return checkRetake();
            }
            setError('Session expired. Please log in again.');
            navigate('/login');
          } else {
            setCanRetake(false);
            setRetakeMessage("Unable to check retake eligibility.");
          }
        }
      };
      checkRetake();
    }
  }, [puzzle?.isCompleted, isTimeUp, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-800">Submitting assessment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Slide Puzzle</h1>
          <div className="text-gray-600">
            Moves: {puzzle?.moves} | Time: {formatTime(timer)}
          </div>
        </div>

        {/* Only show non-validation errors */}
        {error && !error.includes('Invalid move') && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        {isPaused && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center">
            <p className="font-bold">Game Paused</p>
            <p>Moves: {savedState?.moves} | Time: {formatTime(savedState?.time)}</p>
          </div>
        )}

        {isTimeUp && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg text-center">
            <p className="font-bold">Time's Up!</p>
            <p>Game Over - You ran out of time</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 bg-gray-200 p-2 rounded-lg">
          {puzzle?.currentState.map((row, i) => (
            row.map((cell, j) => (
              <button
                key={`${i}-${j}`}
                className={`w-20 h-20 flex items-center justify-center text-2xl font-bold rounded-lg
                  ${cell === 0 ? 'bg-transparent' : 'bg-white hover:bg-gray-100'}
                  ${validMoves.includes(`${i},${j}`) ? 'ring-2 ring-blue-500' : ''}
                  ${(puzzle.isCompleted || isPaused || isTimeUp) ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => !puzzle.isCompleted && !isPaused && !isTimeUp && makeMove(i, j)}
                disabled={cell === 0 || puzzle.isCompleted || isPaused || isTimeUp}
              >
                {cell !== 0 && cell}
              </button>
            ))
          ))}
        </div>

        {!puzzle?.isCompleted && !isTimeUp && (
          <div className="mt-6 space-y-2">
            <button
              onClick={togglePause}
              className={`w-full px-4 py-2 rounded-lg ${
                isPaused 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isPaused ? 'Resume Game' : 'Pause Game'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {(puzzle?.isCompleted || isTimeUp) && (
          <div className="mt-6 text-center">
            <p className={`text-xl font-bold mb-4 ${isTimeUp ? 'text-red-600' : 'text-green-600'}`}> 
              {isTimeUp ? "Time's Up!" : "Congratulations! You solved the puzzle!"}
            </p>
            <p className="text-gray-600 mb-4">
              Moves: {puzzle.moves} | Time: {formatTime(timer)}
            </p>
            <p className="text-gray-600 mb-4">
              Score: {score} points
            </p>
            <p className={`text-lg font-semibold mb-4 ${
              score === 100 ? 'text-green-600' : 
              score >= 85 ? 'text-blue-600' : 
              score >= 70 ? 'text-yellow-600' : 
              'text-orange-600'
            }`}>
              {scoreMessage}
            </p>
            {canRetake ? (
              <button
                onClick={() => navigate('/assessment/quiz/puzzle-game')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
              >
                Retake Assessment
              </button>
            ) : retakeMessage ? (
              <div className="mb-4 text-yellow-700 bg-yellow-100 rounded-lg px-4 py-2 text-center">
                {retakeMessage}
              </div>
            ) : null}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleGame; 