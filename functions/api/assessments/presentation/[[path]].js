// Presentation assessment API handler
import { connectToMongoDB } from '../../../utils/mongodb.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/assessments/presentation/', '');
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
    
    // Handle pending assessments route
    if (path === 'pending') {
      // Return mock pending assessments
      return new Response(JSON.stringify({
        success: true,
        pendingAssessments: [
          {
            _id: 'pending1',
            userId: 'user1',
            type: 'presentation',
            status: 'pending',
            title: 'Product Pitch',
            submittedAt: new Date().toISOString(),
            videoUrl: 'https://example.com/video1.mp4'
          },
          {
            _id: 'pending2',
            userId: 'user2',
            type: 'presentation',
            status: 'pending',
            title: 'Research Findings',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            videoUrl: 'https://example.com/video2.mp4'
          }
        ]
      }), { headers });
    }
    
    // Handle evaluate route
    else if (path === 'evaluate' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      
      // Validate required fields
      if (!body.videoUrl && !body.transcript) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Video URL or transcript is required'
        }), {
          headers,
          status: 400
        });
      }
      
      // Return mock evaluation results
      return new Response(JSON.stringify({
        success: true,
        assessment: {
          _id: 'assessment_' + Date.now(),
          score: 85,
          feedback: 'Good presentation skills. Consider improving eye contact and pacing.',
          criteria: [
            { name: 'Content', score: 90, feedback: 'Well-structured and informative content.' },
            { name: 'Delivery', score: 80, feedback: 'Good voice modulation but could improve pacing.' },
            { name: 'Visual Aids', score: 85, feedback: 'Effective use of visual aids.' },
            { name: 'Engagement', score: 83, feedback: 'Good engagement with the audience.' }
          ],
          timestamp: new Date().toISOString()
        }
      }), { headers });
    }
    
    // Handle results route
    else if (path === 'results') {
      // Return mock presentation assessment results
      return new Response(JSON.stringify({
        success: true,
        results: [
          {
            _id: 'result1',
            userId: 'user1',
            type: 'presentation',
            title: 'Product Pitch',
            score: 85,
            feedback: 'Good presentation skills. Consider improving eye contact and pacing.',
            criteria: [
              { name: 'Content', score: 90 },
              { name: 'Delivery', score: 80 },
              { name: 'Visual Aids', score: 85 },
              { name: 'Engagement', score: 83 }
            ],
            timestamp: new Date().toISOString()
          },
          {
            _id: 'result2',
            userId: 'user1',
            type: 'presentation',
            title: 'Research Findings',
            score: 78,
            feedback: 'Good content but delivery needs improvement.',
            criteria: [
              { name: 'Content', score: 85 },
              { name: 'Delivery', score: 70 },
              { name: 'Visual Aids', score: 80 },
              { name: 'Engagement', score: 75 }
            ],
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      }), { headers });
    }
    
    // Default response for unhandled routes
    return new Response(JSON.stringify({
      message: `Presentation assessment endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    console.error(`Error handling presentation assessment request to ${path}:`, error);
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