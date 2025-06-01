/**
 * Calculate the average score from multiple criteria scores
 * @param {Object} criteriaScores - Object containing individual criteria scores
 * @returns {Number} - The calculated average score rounded to 1 decimal place
 */
export const calculateAverageScore = (criteriaScores) => {
    if (!criteriaScores) return 0;
    
    const scores = Object.values(criteriaScores).filter(score => typeof score === 'number' && !isNaN(score));
    
    if (scores.length === 0) return 0;
    
    const sum = scores.reduce((total, score) => total + score, 0);
    const average = sum / scores.length;
    
    // Round to 1 decimal place
    return Math.round(average * 10) / 10;
};
