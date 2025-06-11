// Cloudflare Pages Functions worker

export default {
  async fetch(request, env, ctx) {
    // Get the URL and pathname
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle API routes
    if (path.startsWith('/api/')) {
      // API request handling will be done by the specific handlers
      // This is just a fallback in case no specific handler matches
      return new Response(JSON.stringify({
        error: 'API endpoint not found',
        path
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // For all other routes, let Cloudflare Pages handle it
    return env.ASSETS.fetch(request);
  }
}; 