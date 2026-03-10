# Deployment Instructions

This guide explains how to deploy the Share Now application to GitHub Pages.

## Automatic Deployment (Recommended)

The repository is configured with GitHub Actions for automatic deployment. Follow these steps:

1. **Enable GitHub Pages in Repository Settings**
   - Go to your repository: https://github.com/pomali/share-now
   - Click on "Settings" tab
   - In the left sidebar, click "Pages"
   - Under "Source", select "GitHub Actions"

2. **Set Your Custom Domain**
   - In repository Settings -> Pages -> Custom domain, enter: `share-now.arcicode.com`
   - Ensure your DNS provider has a `CNAME` record:
     - Host/Name: `share-now`
     - Value/Target: `pomali.github.io`

3. **Push to `main`**
   - The deployment workflow will automatically run on every push
   - The site will be deployed to: https://share-now.arcicode.com/

4. **Monitor Deployment**
   - Go to the "Actions" tab in your repository
   - You'll see the "Deploy to GitHub Pages" workflow running
   - Once it completes (should take 1-2 minutes), your site will be live

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build the application
npm run build

# The built files will be in the 'dist' directory
# You can deploy this directory to any static hosting service
```

## Post-Deployment

After deployment, visit your site at https://share-now.arcicode.com/ and:

1. Test the Sender page - enter text and verify QR code generation
2. Test the Receiver page - verify camera permissions work (you may need HTTPS)
3. Try sharing between two devices

## Camera Permissions

Note: The camera scanning feature requires HTTPS (or localhost). GitHub Pages provides HTTPS by default, so camera access will work once deployed.

## URL Routing

This application uses React Router for client-side routing. To support direct URL access (e.g., `https://share-now.arcicode.com/receiver`), the repository includes:

- **404.html**: Intercepts 404 errors and redirects to index.html with the path preserved
- **Redirect handler in index.html**: Restores the original URL before React Router loads

This allows users to:
- Navigate directly to any route (sender, receiver, etc.)
- Refresh the page without losing their position
- Share direct links to specific pages

The solution is based on [spa-github-pages](https://github.com/rafgraph/spa-github-pages).

## Troubleshooting

### Site shows 404 on the home page
- Ensure GitHub Pages is enabled in repository settings
- Verify the source is set to "GitHub Actions"
- Check that the workflow completed successfully in the Actions tab

### Camera not working
- Ensure you're accessing via HTTPS (GitHub Pages uses HTTPS by default)
- Grant camera permissions when prompted by the browser
- Try a different browser if issues persist

### Blank page after deployment
- Check browser console for errors
- Verify DNS points `share-now.arcicode.com` to `pomali.github.io`
- Clear browser cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R)

## Updating the Site

Any changes pushed to the `main` branch will automatically trigger a new deployment. The process takes about 1-2 minutes.
