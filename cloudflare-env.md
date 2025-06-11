# Cloudflare Pages Environment Variables Guide

To ensure your backend functions work correctly, you need to set up the following environment variables in your Cloudflare Pages dashboard:

## Required Environment Variables

1. **MONGODB_URI**
   - Value: `mongodb+srv://username:password@cluster.mongodb.net/edusoft`
   - Replace with your actual MongoDB connection string
   - This is used to connect to your MongoDB database

2. **JWT_SECRET**
   - Value: `your_jwt_secret_here`
   - Replace with a secure random string
   - This is used to sign and verify JWT tokens for authentication

3. **NODE_ENV**
   - Value: `production`
   - This tells the application to run in production mode

## How to Set Environment Variables

1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Click on "Settings" > "Environment variables"
4. Add each of the variables above
5. Make sure to set them for both "Production" and "Preview" environments
6. Click "Save" to apply the changes

## Testing Your API

After deployment, you can test if your API is working by visiting:

`https://your-site-name.pages.dev/test-api.html`

This page will allow you to test various API endpoints to ensure they're working correctly.

## Troubleshooting

If your API endpoints aren't working:

1. Check the Function logs in the Cloudflare Pages dashboard
2. Verify that your environment variables are set correctly
3. Make sure your MongoDB connection string is valid and accessible from Cloudflare
4. Check that your Content Security Policy allows connections to your API endpoints 