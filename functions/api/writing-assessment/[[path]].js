// Writing assessment API handler
import { connectToMongoDB } from '../../utils/mongodb.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/writing-assessment/', '');
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
    
    // Handle generate-prompt route
    if (path.startsWith('generate-prompt')) {
      // Parse query parameters
      const params = new URLSearchParams(url.search);
      const level = params.get('level') || 'b2';
      const language = params.get('language') || 'english';
      
      // Return mock writing prompt
      return new Response(JSON.stringify({
        success: true,
        prompt: {
          title: 'Technology Impact',
          prompt: 'Write an essay discussing how technology has changed your daily life. Include both positive and negative impacts.',
          timeLimit: 30,
          wordLimit: 250,
          criteria: [
            'Organization and Structure',
            'Grammar and Vocabulary',
            'Critical Thinking',
            'Relevance to Topic'
          ],
          level: level.toUpperCase(),
          language: language
        }
      }), { headers });
    }
    
    // Handle evaluate route
    else if (path === 'evaluate' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      
      // Validate required fields
      if (!body.text) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Text is required for evaluation'
        }), {
          headers,
          status: 400
        });
      }
      
      // Return mock evaluation results
      return new Response(JSON.stringify({
        success: true,
        assessment: {
          _id: 'writing_assessment_' + Date.now(),
          score: 84,
          level: 'B2',
          feedback: 'Well-written essay with good structure and vocabulary.',
          criteria: [
            { name: 'Organization and Structure', score: 85, feedback: 'Well-organized with clear paragraphs.' },
            { name: 'Grammar and Vocabulary', score: 82, feedback: 'Good use of vocabulary with few grammatical errors.' },
            { name: 'Critical Thinking', score: 88, feedback: 'Good analysis of the topic.' },
            { name: 'Relevance to Topic', score: 80, feedback: 'Mostly relevant to the topic.' }
          ],
          wordCount: body.text.split(/\s+/).length,
          timestamp: new Date().toISOString()
        }
      }), { headers });
    }
    
    // Handle results route
    else if (path === 'results') {
      // Return mock writing assessment results
      return new Response(JSON.stringify({
        success: true,
        results: [
          {
            _id: 'writing_result1',
            userId: 'user1',
            type: 'writing',
            title: 'Technology Impact',
            score: 84,
            level: 'B2',
            feedback: 'Well-written essay with good structure and vocabulary.',
            criteria: [
              { name: 'Organization and Structure', score: 85 },
              { name: 'Grammar and Vocabulary', score: 82 },
              { name: 'Critical Thinking', score: 88 },
              { name: 'Relevance to Topic', score: 80 }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      }), { headers });
    }
    
    // Default response for unhandled routes
    return new Response(JSON.stringify({
      message: `Writing assessment endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    console.error(`Error handling writing assessment request to ${path}:`, error);
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