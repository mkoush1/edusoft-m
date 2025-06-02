import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PresentationRecommendations.css';

const PresentationRecommendations = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await fetch(`/api/presentation/recommendations`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch recommendations');
                }

                const data = await response.json();
                if (data.success) {
                    setRecommendations(data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading) {
        return (
            <div className="recommendations-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading your presentation recommendations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recommendations-container">
                <div className="error-container">
                    <h2>Oops! Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recommendations-container">
            <div className="header">
                <h1>Presentation Skills Assessment Results</h1>
                <p className="subtitle">Based on your most recent presentation assessment</p>
            </div>

            <div className="score-section">
                <div className="score-circle">
                    <span className="score-number">{recommendations.score}</span>
                    <span className="score-text">/100</span>
                </div>
                <div className="score-details">
                    <h3>Overall Score</h3>
                    <p>This score reflects your performance across:</p>
                    <ul>
                        <li>Content Quality</li>
                        <li>Delivery Skills</li>
                        <li>Visual Presentation</li>
                        <li>Time Management</li>
                    </ul>
                </div>
            </div>
            
            <div className="recommendations-header">
                <h2>Recommended Courses</h2>
                <p>Personalized recommendations to help you improve your presentation skills</p>
            </div>

            <div className="courses-grid">
                {recommendations.recommendations.map((course, index) => (
                    <div key={index} className="course-card">
                        <h3>{course.title}</h3>
                        <p className="course-description">{course.description}</p>
                        <p className="course-level">Level: {course.level}</p>
                        <a href={course.link} target="_blank" rel="noopener noreferrer" className="course-link">
                            Start Course
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PresentationRecommendations;
