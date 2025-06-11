// Cloudflare Pages Function to handle API requests and connect to MongoDB
import { connectToMongoDB } from '../utils/mongodb.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
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
    // Connect to MongoDB (this will use our mock implementation for now)
    const mongodb = await connectToMongoDB(env);
    
    // Extract auth token if present
    let token = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Handle different API routes
    if (path.startsWith('auth/')) {
      return handleAuthRoutes(path.replace('auth/', ''), request, headers, env, mongodb);
    } else if (path.startsWith('users/')) {
      return handleUserRoutes(path.replace('users/', ''), request, headers, token, env, mongodb);
    } else if (path.startsWith('assessments/')) {
      return handleAssessmentRoutes(path.replace('assessments/', ''), request, headers, token, env, mongodb);
    }
    
    // Default response for unhandled routes
    return new Response(JSON.stringify({
      message: `API endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    console.error(`Error handling request to ${path}:`, error);
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

// Handle authentication routes
async function handleAuthRoutes(path, request, headers, env, mongodb) {
  try {
    // Extract request body
    const body = await request.json().catch(() => ({}));
    const db = mongodb.db('edusoft');
    
    if (path === 'user/login') {
      // Find user in the database
      const user = await db.collection('users').findOne({ 
        email: body.email, 
        role: 'user'
      });
      
      if (user) {
        // In a real application, you would verify the password here
        // For now, we'll just return a successful login
        return new Response(JSON.stringify({
          success: true,
          token: 'user_token_' + Date.now(),
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }), { headers });
      } else {
        // User not found - for demo purposes, create a mock user
        return new Response(JSON.stringify({
          success: true,
          token: 'mock_user_token_' + Date.now(),
          user: {
            _id: 'user_' + Date.now(),
            name: body.email?.split('@')[0] || 'User',
            email: body.email,
            role: 'user'
          }
        }), { headers });
      }
    } 
    else if (path === 'supervisor/login') {
      // Find supervisor in the database
      const supervisor = await db.collection('users').findOne({ 
        email: body.email, 
        role: 'supervisor'
      });
      
      if (supervisor) {
        // In a real application, you would verify the password here
        return new Response(JSON.stringify({
          success: true,
          token: 'supervisor_token_' + Date.now(),
          user: {
            _id: supervisor._id,
            name: supervisor.name,
            email: supervisor.email,
            role: supervisor.role
          }
        }), { headers });
      } else {
        // Supervisor not found - for demo purposes, create a mock supervisor
        return new Response(JSON.stringify({
          success: true,
          token: 'mock_supervisor_token_' + Date.now(),
          user: {
            _id: 'supervisor_' + Date.now(),
            name: body.email?.split('@')[0] || 'Supervisor',
            email: body.email,
            role: 'supervisor'
          }
        }), { headers });
      }
    }
    else if (path === 'user/signup' || path === 'supervisor/signup') {
      const role = path.startsWith('supervisor') ? 'supervisor' : 'user';
      
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email: body.email });
      
      if (existingUser) {
        return new Response(JSON.stringify({
          success: false,
          message: 'User with this email already exists'
        }), { 
          headers,
          status: 400
        });
      }
      
      // Create new user
      const result = await db.collection('users').insertOne({
        name: body.name,
        email: body.email,
        password: 'hashed_' + body.password, // In a real app, you would hash the password
        role: role,
        createdAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Account created successfully',
        user: {
          _id: result.insertedId,
          name: body.name,
          email: body.email,
          role: role
        }
      }), { headers });
    }
    
    // Default response for unhandled auth routes
    return new Response(JSON.stringify({
      message: `Auth endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    console.error(`Error in auth route ${path}:`, error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error in auth route',
      path
    }), {
      headers,
      status: 500
    });
  }
}

// Handle user routes
async function handleUserRoutes(path, request, headers, token, env, mongodb) {
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
  
  try {
    const db = mongodb.db('edusoft');
    
    if (path === 'profile') {
      if (request.method === 'GET') {
        // In a real app, you would extract the user ID from the token
        // For now, we'll just return the first user's profile
        const user = await db.collection('users').findOne({ role: 'user' });
        
        if (user) {
          // Get user progress
          const progress = await db.collection('progress').findOne({ userId: user._id });
          
          return new Response(JSON.stringify({
            success: true,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              progress: progress || {
                completedCourses: 0,
                inProgressCourses: 0
              }
            }
          }), { headers });
        } else {
          // No user found - return mock data
          return new Response(JSON.stringify({
            success: true,
            user: {
              _id: 'user_profile_' + Date.now(),
              name: 'Demo User',
              email: 'user@example.com',
              role: 'user',
              progress: {
                completedCourses: 3,
                inProgressCourses: 2
              }
            }
          }), { headers });
        }
      }
    }
    
    // Default response for unhandled user routes
    return new Response(JSON.stringify({
      message: `User endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error in user route',
      path
    }), {
      headers,
      status: 500
    });
  }
}

// Handle assessment routes
async function handleAssessmentRoutes(path, request, headers, token, env, mongodb) {
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
  
  try {
    const db = mongodb.db('edusoft');
    
    if (path.startsWith('results/')) {
      const assessmentType = path.replace('results/', '');
      
      // Get assessments from database
      const assessments = await db.collection('assessments')
        .find({ type: assessmentType })
        .toArray();
      
      if (assessments.length > 0) {
        // Return the most recent assessment
        const latestAssessment = assessments.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )[0];
        
        return new Response(JSON.stringify({
          success: true,
          results: {
            assessmentType,
            score: latestAssessment.score,
            feedback: latestAssessment.feedback,
            timestamp: latestAssessment.timestamp,
            details: latestAssessment.details || []
          }
        }), { headers });
      } else {
        // No assessments found - return mock data
        return new Response(JSON.stringify({
          success: true,
          results: {
            assessmentType,
            score: 85,
            feedback: 'Good job on your assessment!',
            timestamp: new Date().toISOString(),
            details: [
              { category: 'Knowledge', score: 90 },
              { category: 'Application', score: 80 },
              { category: 'Analysis', score: 85 }
            ]
          }
        }), { headers });
      }
    }
    
    // Default response for unhandled assessment routes
    return new Response(JSON.stringify({
      message: `Assessment endpoint not implemented: ${path}`,
      success: false
    }), {
      headers,
      status: 404
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error in assessment route',
      path
    }), {
      headers,
      status: 500
    });
  }
} 