# 🚀 Deploy to Vercel - Step by Step Guide

## Method 1: Vercel Dashboard (Recommended)

### Step 1: Go to Vercel Dashboard
1. Open [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"

### Step 2: Import Your Repository
1. Connect your GitHub/GitLab account if not already connected
2. Select your `luma-go-fresh-start` repository
3. Set the **Root Directory** to `backend`
4. Click "Continue"

### Step 3: Configure Project
1. **Project Name**: `luma-go-backend` (or your preferred name)
2. **Framework Preset**: Select "Node.js"
3. **Build Command**: Leave empty (not needed for this simple server)
4. **Output Directory**: Leave empty
5. **Install Command**: `npm install`
6. **Root Directory**: `backend`

### Step 4: Environment Variables (Optional)
Add these if needed:
- `NODE_ENV`: `production`
- `VERCEL`: `true`

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy the generated URL (e.g., `https://luma-go-backend.vercel.app`)

### Step 6: Update Your App Configuration
Update `src/config/updateServer.ts` with your new Vercel URL:
```typescript
baseUrl: 'https://your-new-vercel-url.vercel.app/v1'
```

## Method 2: GitHub Integration (Alternative)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### Step 2: Connect in Vercel
1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Vercel will automatically detect the `vercel.json` configuration
4. Deploy!

## Testing Your Deployment

After deployment, test your endpoints:

```bash
# Health check
curl https://your-vercel-url.vercel.app/v1/health

# Update check
curl -X POST https://your-vercel-url.vercel.app/v1/updates/check \
  -H "Content-Type: application/json" \
  -d '{"currentVersion":"1.0.0","platform":"ios","deviceId":"test-device"}'

# Gen 2 updates
curl -X POST https://your-vercel-url.vercel.app/v1/updates/gen2 \
  -H "Content-Type: application/json" \
  -d '{"currentVersion":"1.0.0","platform":"ios","deviceId":"test-device"}'
```

## Expected Response

You should see responses like:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-16T...",
  "version": "1.0.0",
  "updates": ["1.1.0", "1.2.0", "2.0.0"]
}
```

## Troubleshooting

### If you get 404 errors:
1. Check that the `vercel.json` file is in the root of your backend directory
2. Ensure `update-server.js` is the main file
3. Verify the routes in `vercel.json` match your endpoints

### If you get CORS errors:
1. The server already includes CORS configuration
2. Check that your frontend is using the correct URL

### If deployment fails:
1. Check the Vercel logs for specific errors
2. Ensure all dependencies are in `package.json`
 