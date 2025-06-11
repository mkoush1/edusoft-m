export async function onRequest(context) {
  // Extract path and method from request
  const { request } = context;
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
    // This is a placeholder - in a real implementation, you would route to your backend API
    // For now, we'll return a mock response
    const responseData = {
      message: `API request received for path: ${path}, method: ${method}`,
      success: true,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(responseData), {
      headers,
      status: 200
    });
  } catch (error) {
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