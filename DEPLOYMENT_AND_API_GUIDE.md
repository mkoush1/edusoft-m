# EduSoft Deployment and API Guide

This guide provides comprehensive instructions for deploying the EduSoft educational management application to Cloudflare Pages and configuring its serverless API functionality.

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Cloudflare Pages Setup](#cloudflare-pages-setup)
3. [Environment Variables](#environment-variables)
4. [API Endpoints](#api-endpoints)
5. [Testing the Deployment](#testing-the-deployment)
6. [Troubleshooting](#troubleshooting)

## Deployment Overview

EduSoft is deployed as a full-stack application on Cloudflare Pages with:
- Frontend: React application served as static files
- Backend: Serverless API functions using Cloudflare Functions
- Database: MongoDB Atlas for data storage

## Cloudflare Pages Setup

### Initial Setup

1. Create a Cloudflare account if you don't have one
2. Connect your GitHub repository to Cloudflare Pages
3. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Build output directory: `frontend/dist`

### Configuration Files

The deployment relies on several configuration files:

- `wrangler.toml`: Main configuration for Cloudflare Pages and Functions
- `.cloudflare/pages.toml`: Additional Pages configuration
- `frontend/public/_headers`: HTTP headers configuration for security
- `frontend/public/_redirects`: URL redirect rules

## Environment Variables

Set the following environment variables in the Cloudflare Pages dashboard:

1. `MONGODB_URI`: Your MongoDB connection string
2. `JWT_SECRET`: Secret key for JWT authentication

To set these variables:
1. Go to your Cloudflare Pages project
2. Navigate to Settings > Environment variables
3. Add each variable for both Production and Preview environments

## API Endpoints

EduSoft provides several API endpoints for different assessment types:

### Presentation Assessment API

- `GET /api/assessments/presentation/pending`: Get pending presentation assessments
- `GET /api/assessments/presentation/results`: Get presentation assessment results
- `POST /api/assessments/presentation/evaluate`: Submit a presentation for evaluation

### Writing Assessment API

- `GET /api/writing-assessment/generate-prompt`: Get a writing prompt
- `GET /api/writing-assessment/results`: Get writing assessment results
- `POST /api/writing-assessment/evaluate`: Submit text for evaluation

### Speaking Assessment API

- `GET /api/speaking-assessment/pending`: Get pending speaking assessments
- `GET /api/speaking-assessment/results`: Get speaking assessment results
- `POST /api/speaking-assessment/evaluate`: Submit audio for speaking evaluation

### Communication Assessment API

- `GET /api/communication/results`: Get communication assessment results
- `POST /api/communication/assess`: Submit communication for assessment

## Testing the Deployment

After deploying, you can test the API endpoints using the included test pages:

1. Visit `https://your-site.pages.dev/api-test.html` to test all API endpoints
2. Each endpoint can be tested individually with the provided buttons

## Troubleshooting

### Common Issues

1. **API 404 Errors**
   - Check that route patterns in `wrangler.toml` match your API endpoints
   - Verify Functions directory structure matches route patterns

2. **CORS Errors**
   - Check `_headers` file for proper CORS configuration
   - Ensure API handlers include proper CORS headers

3. **Database Connection Issues**
   - Verify MongoDB connection string is correct
   - Check network access settings in MongoDB Atlas

4. **Build Failures**
   - Review build logs in Cloudflare Pages dashboard
   - Ensure all dependencies are properly installed

### Debugging Tips

1. Use the browser developer console to check for errors
2. Check Cloudflare Pages logs for function execution issues
3. Test API endpoints using the provided test pages
4. Verify environment variables are set correctly

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions Documentation](https://developers.cloudflare.com/pages/platform/functions/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) 