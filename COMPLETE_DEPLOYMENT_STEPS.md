# Complete Cloudflare Pages Deployment Guide for EduSoft

This guide provides step-by-step instructions to deploy the EduSoft application to Cloudflare Pages with both frontend and backend functionality.

## Prerequisites

1. A Cloudflare account
2. A GitHub account with the repository cloned
3. MongoDB Atlas account (for database)

## Step 1: Prepare Your Repository

Ensure your repository has the following structure and files:

- `frontend/` - Contains the React application
- `functions/` - Contains Cloudflare Functions for backend API
- `wrangler.toml` - Configuration for Cloudflare Pages
- `.cloudflare/pages.toml` - Additional Pages configuration

## Step 2: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is sufficient for testing)
3. Create a database user with read/write permissions
4. Add your IP address to the network access list (or allow access from anywhere for testing)
5. Get your MongoDB connection string (it will look like `mongodb+srv://username:password@cluster.mongodb.net/edusoft`)

## Step 3: Connect Your Repository to Cloudflare Pages

1. Log in to your Cloudflare dashboard
2. Go to Pages > Create a project > Connect to Git
3. Select your GitHub account and repository
4. Configure build settings:
   - Project name: `edusoft` (or your preferred name)
   - Production branch: `main`
   - Build command: `cd frontend && npm install && npm run build`
   - Build output directory: `frontend/dist`
   - Root directory: `/` (leave as default)

## Step 4: Configure Environment Variables

1. In your Cloudflare Pages project, go to Settings > Environment variables
2. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for authentication
3. Make sure to add these variables to both Production and Preview environments

## Step 5: Enable Cloudflare Functions

1. In your Cloudflare Pages project, go to Settings > Functions
2. Enable Functions if not already enabled
3. Under "Functions configuration", ensure:
   - Functions directory is set to `/functions`
   - Compatibility date is set to the current date

## Step 6: Deploy Your Application

1. Click "Save and Deploy" in the Cloudflare Pages dashboard
2. Wait for the build and deployment process to complete
3. Once deployed, Cloudflare will provide a URL like `https://edusoft.pages.dev`

## Step 7: Verify Deployment

1. Visit your deployed application URL
2. Navigate to `/api-test.html` to test API endpoints
3. Check that environment variables are properly configured
4. Test each API endpoint to ensure they're working correctly

## Step 8: Troubleshooting Common Issues

### Frontend Issues

1. **Blank page or React errors**:
   - Check browser console for errors
   - Ensure build completed successfully in deployment logs
   - Verify that all frontend dependencies were installed

2. **CSS/styling issues**:
   - Check if CSS files were properly included in the build
   - Verify that the build output directory contains all assets

### Backend Issues

1. **API 404 errors**:
   - Check that route patterns in `wrangler.toml` match your API endpoints
   - Verify Functions directory structure matches route patterns
   - Check Cloudflare Functions logs for errors

2. **Database connection issues**:
   - Verify MongoDB connection string is correct
   - Ensure MongoDB Atlas cluster is running
   - Check network access settings in MongoDB Atlas
   - Verify environment variables are set correctly

3. **CORS errors**:
   - Check `_headers` file for proper CORS configuration
   - Ensure API handlers include proper CORS headers

## Step 9: Custom Domain Setup (Optional)

1. In your Cloudflare Pages project, go to Custom domains
2. Click "Set up a custom domain"
3. Enter your domain and follow the instructions
4. Update DNS settings as instructed

## Step 10: Ongoing Maintenance

1. Set up continuous deployment by connecting your GitHub repository
2. Monitor application performance in Cloudflare Analytics
3. Check Cloudflare Functions logs for any errors
4. Update environment variables as needed

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions Documentation](https://developers.cloudflare.com/pages/platform/functions/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) 