# Full Deployment Guide for EduSoft

This guide explains how to deploy both the frontend and backend components of the EduSoft application to Cloudflare Pages.

## Overview

The EduSoft application consists of:
1. A React frontend (in the `frontend` directory)
2. A Node.js/Express backend (in the `backend` directory)

We'll deploy both components using Cloudflare Pages and Cloudflare Functions.

## Prerequisites

- A Cloudflare account
- Git repository with your code (GitHub, GitLab, or Bitbucket)
- MongoDB Atlas account (or another MongoDB provider)

## Step 1: Prepare Your Environment Variables

Create a `.env` file in your backend directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

Make sure to replace the placeholder values with your actual credentials.

## Step 2: Configure Cloudflare Pages

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Navigate to "Pages"

2. **Create a new project**
   - Click "Create a project"
   - Select "Connect to Git"
   - Choose your Git provider (GitHub, GitLab, or Bitbucket)
   - Authorize Cloudflare Pages to access your repositories
   - Select the repository containing your EduSoft application

3. **Configure your build settings**
   - Set the following build configuration:
     - Project name: `edusoft` (or your preferred name)
     - Production branch: `main` (or your default branch)
     - Build command: `cd frontend && npm install && npm run build`
     - Build output directory: `frontend/dist`
     - Node.js version: `18` (or higher)

4. **Set up environment variables**
   - Add the following environment variables in the Cloudflare Pages dashboard:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret for authentication
     - `NODE_ENV`: Set to `production`

## Step 3: Deploy Your Application

1. **Push your changes to GitHub**
   - Make sure all your changes are committed and pushed to your repository

2. **Deploy in Cloudflare Pages**
   - Click "Save and Deploy" in the Cloudflare Pages dashboard
   - Wait for the build and deployment to complete

## Step 4: Set Up Backend API with Cloudflare Functions

Cloudflare Functions allows you to run server-side code without managing a separate backend server. Here's how to set it up:

1. **Configure API routes**
   - The `functions/api/[[path]].js` file handles API requests
   - The `functions/_middleware.js` file adds CORS headers to all responses

2. **Connect to MongoDB**
   - Cloudflare Functions can connect to your MongoDB database using the environment variables you set up

3. **Test your API endpoints**
   - After deployment, test your API endpoints by visiting:
     - `https://your-project-name.pages.dev/api/test`

## Step 5: Update Frontend API URLs

1. **Update API URLs in your frontend code**
   - Make sure your frontend is pointing to the Cloudflare Pages URL for API requests
   - Example: `https://your-project-name.pages.dev/api/`

## Troubleshooting

### Build Issues

1. **Build command fails**
   - Check the build logs in the Cloudflare Pages dashboard
   - Ensure all dependencies are properly installed
   - Verify that the build scripts in package.json are correct

2. **API connection issues**
   - Check that your environment variables are correctly set in the Cloudflare Pages dashboard
   - Verify that your MongoDB connection string is correct
   - Check CORS settings if you're experiencing cross-origin issues

3. **Functions not working**
   - Ensure the functions directory is properly configured
   - Check the Cloudflare Functions logs for errors

## Maintenance and Updates

1. **Updating your application**
   - Push changes to your GitHub repository
   - Cloudflare Pages will automatically rebuild and deploy your application

2. **Monitoring**
   - Use Cloudflare Analytics to monitor your application's performance
   - Check the Cloudflare Pages logs for any errors

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions Documentation](https://developers.cloudflare.com/pages/platform/functions/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) 