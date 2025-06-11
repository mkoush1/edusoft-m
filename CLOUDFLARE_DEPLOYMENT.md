# Deploying to Cloudflare Pages

This guide will help you deploy the EduSoft application to Cloudflare Pages.

## Prerequisites

- A Cloudflare account
- Git repository with your code (GitHub, GitLab, or Bitbucket)

## Deployment Steps

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

4. **Environment variables (if needed)**
   - If your application requires environment variables, add them in the "Environment variables" section
   - For example, you might need to add:
     - `VITE_API_URL`: Your backend API URL

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build and deployment to complete

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. **Build command fails**
   - Ensure the `build` script is correctly defined in your `frontend/package.json`
   - Check if all dependencies are properly installed

2. **Routing issues**
   - Ensure the `_redirects` file is present in the `frontend/public` directory
   - The file should contain: `/* /index.html 200`

3. **API connection issues**
   - If your frontend can't connect to your backend API, check your CORS settings
   - Ensure your API URL is correctly set in environment variables

## Additional Configuration

For more advanced configuration, you can use the `wrangler.toml` or `pages.toml` files in your repository root.

## Updating Your Deployment

Any push to your main branch will trigger a new deployment. You can also manually trigger deployments from the Cloudflare Pages dashboard. 