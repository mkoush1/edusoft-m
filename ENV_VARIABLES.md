# Environment Variables for EduSoft Deployment

This document outlines the necessary environment variables for deploying the EduSoft application to Cloudflare Pages.

## Required Environment Variables

When deploying to Cloudflare Pages, you need to set the following environment variables in the Cloudflare dashboard:

### Database Configuration

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edusoft
```

Replace `username`, `password`, and `cluster.mongodb.net` with your actual MongoDB Atlas credentials.

### Authentication

```
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
```

The JWT secret should be a strong, random string used to sign authentication tokens.

### API Configuration

```
API_URL=/api
NODE_ENV=production
```

## Setting Environment Variables in Cloudflare

1. Go to your Cloudflare Pages project dashboard
2. Navigate to Settings > Environment variables
3. Add each variable for both Production and Preview environments
4. Save your changes

## Local Development

For local development, create a `.env` file in the project root with these variables. This file should not be committed to Git for security reasons.

Example `.env` file:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edusoft
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
API_URL=http://localhost:5000/api
NODE_ENV=development
```

## Verifying Environment Variables

To verify that your environment variables are correctly set in Cloudflare:

1. Deploy your application
2. Visit the API test page at `/api-test.html`
3. Test the MongoDB connection by clicking any API endpoint button
4. Check the response for connection errors

If you see database connection errors, verify that:
- Your MongoDB URI is correct
- Your MongoDB Atlas cluster is configured to accept connections from Cloudflare's IP ranges
- Your database user has the correct permissions 