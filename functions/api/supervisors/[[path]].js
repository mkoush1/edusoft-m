// Supervisor API handler
import { connectToMongoDB } from '../../utils/mongodb.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/supervisors/', '');
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
    
    // Check for authentication
    if (!token) {
      return new Response(JSON.stringify({
        message: 'Authentication required',
        success: false
      }), {
        headers,
        status: 401
      });
    }
    
    // Connect to MongoDB
    const mongodb = await connectToMongoDB(env);
    const db = mongodb.db('edusoft');
    
    // Handle dashboard route
    if (path === 'dashboard') {
      // Get all users
      const users = await db.collection('users')
        .find({ role: 'user' })
        .toArray();
      
      // Get all assessments
      const assessments = await db.collection('assessments')
        .find({})
        .toArray();
      
      // Calculate statistics
      const totalUsers = users.length;
      const totalAssessments = assessments.length;
      
      // Count assessments by type
      const assessmentsByType = {};
      assessments.forEach(assessment => {
        assessmentsByType[assessment.type] = (assessmentsByType[assessment.type] || 0) + 1;
      });
      
      // Calculate average scores
      let totalScore = 0;
      assessments.forEach(assessment => {
        totalScore += assessment.score;
      });
      const averageScore = totalAssessments > 0 ? totalScore / totalAssessments : 0;
      
      return new Response(JSON.stringify({
        success: true,
        dashboard: {
          totalUsers,
          totalAssessments,
          assessmentsByType,
          averageScore,
          recentAssessments: assessments
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
        }
      }), { headers });
    }
    
    // Handle create-course route
    else if (path === 'create-course' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      
      // Validate required fields
      if (!body.title || !body.description) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Title and description are required'
        }), {
          headers,
          status: 400
        });
      }
      
      // Create new course
      const result = await db.collection('courses').insertOne({
        title: body.title,
        description: body.description,
        modules: body.modules || [],
        createdAt: new Date().toISOString(),
        createdBy: body.createdBy || 'unknown'
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Course created successfully',
        courseId: result.insertedId
      }), { headers });
    }
    
    // Default response for unhandled routes
    return new Response(JSON.stringify({
      message: `Supervisor endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    console.error(`Error handling supervisor request to ${path}:`, error);
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