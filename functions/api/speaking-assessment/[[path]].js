// Speaking assessment API handler
import { connectToMongoDB } from '../../utils/mongodb.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/speaking-assessment/', '');
  const method = request.method;
  
  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  });
  
  // Handle OPTIONS requests (CORS preflight)
  if (method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // Extract auth token if present
    let token = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Connect to MongoDB
    const mongodb = await connectToMongoDB(env);
    const db = mongodb.db('edusoft');
    
    // Handle evaluate route
    if (path === 'evaluate' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      
      // Return mock evaluation results
      return new Response(JSON.stringify({
        success: true,
        assessment: {
          _id: 'speaking_assessment_' + Date.now(),
          score: 82,
          level: 'B2',
          feedback: 'Good speaking skills with clear pronunciation.',
          criteria: [
            { name: 'Pronunciation', score: 85, feedback: 'Clear pronunciation with minor accent.' },
            { name: 'Fluency', score: 80, feedback: 'Good flow with occasional pauses.' },
            { name: 'Grammar', score: 83, feedback: 'Good grammar with few errors.' },
            { name: 'Vocabulary', score: 80, feedback: 'Good range of vocabulary.' }
          ],
          timestamp: new Date().toISOString()
        }
      }), { headers });
    }
    
    // Handle pending route
    else if (path === 'pending') {
      // Return mock pending speaking assessments
      return new Response(JSON.stringify({
        success: true,
        pendingAssessments: [
          {
            _id: 'speaking_pending1',
            userId: 'user1',
            type: 'speaking',
            status: 'pending',
            prompt: 'Describe your favorite place to visit',
            submittedAt: new Date().toISOString(),
            audioUrl: 'https://example.com/audio1.mp3'
          },
          {
            _id: 'speaking_pending2',
            userId: 'user2',
            type: 'speaking',
            status: 'pending',
            prompt: 'Talk about a memorable experience',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            audioUrl: 'https://example.com/audio2.mp3'
          }
        ]
      }), { headers });
    }
    
    // Handle results route
    else if (path === 'results') {
      // Return mock speaking assessment results
      return new Response(JSON.stringify({
        success: true,
        results: [
          {
            _id: 'speaking_result1',
            userId: 'user1',
            type: 'speaking',
            prompt: 'Describe your favorite place to visit',
            score: 82,
            level: 'B2',
            feedback: 'Good speaking skills with clear pronunciation.',
            criteria: [
              { name: 'Pronunciation', score: 85 },
              { name: 'Fluency', score: 80 },
              { name: 'Grammar', score: 83 },
              { name: 'Vocabulary', score: 80 }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      }), { headers });
    }
    
    // Default response for unhandled routes
    return new Response(JSON.stringify({
      message: `Speaking assessment endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    console.error(`Error handling speaking assessment request to ${path}:`, error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      path,
      method
    }), {
      headers,
      status: 500
    });
  }
} 