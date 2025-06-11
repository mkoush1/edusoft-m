// Communication API handler
import { connectToMongoDB } from '../../utils/mongodb.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/communication/', '');
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
    
    // Handle assess route
    if (path === 'assess' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      
      // Validate required fields
      if (!body.text && !body.videoUrl && !body.audioUrl) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Text, video URL, or audio URL is required for assessment'
        }), {
          headers,
          status: 400
        });
      }
      
      // Return mock assessment results
      return new Response(JSON.stringify({
        success: true,
        assessment: {
          _id: 'communication_assessment_' + Date.now(),
          score: 87,
          level: 'Advanced',
          feedback: 'Excellent communication skills with clear articulation and good structure.',
          criteria: [
            { name: 'Clarity', score: 90, feedback: 'Very clear and articulate.' },
            { name: 'Structure', score: 85, feedback: 'Well-structured communication.' },
            { name: 'Engagement', score: 88, feedback: 'Good engagement and persuasiveness.' },
            { name: 'Adaptability', score: 84, feedback: 'Good adaptability to the context.' }
          ],
          timestamp: new Date().toISOString()
        }
      }), { headers });
    }
    
    // Handle results route
    else if (path === 'results') {
      // Return mock communication assessment results
      return new Response(JSON.stringify({
        success: true,
        results: [
          {
            _id: 'communication_result1',
            userId: 'user1',
            type: 'communication',
            title: 'Professional Communication',
            score: 87,
            level: 'Advanced',
            feedback: 'Excellent communication skills with clear articulation and good structure.',
            criteria: [
              { name: 'Clarity', score: 90 },
              { name: 'Structure', score: 85 },
              { name: 'Engagement', score: 88 },
              { name: 'Adaptability', score: 84 }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      }), { headers });
    }
    
    // Default response for unhandled routes
    return new Response(JSON.stringify({
      message: `Communication endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    console.error(`Error handling communication request to ${path}:`, error);
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