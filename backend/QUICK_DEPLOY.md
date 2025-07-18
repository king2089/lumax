# 🚀 Quick Backend Deployment to Vercel

## **Step 1: Go to Vercel Dashboard**
1. Open [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"

## **Step 2: Upload Backend**
1. Click "Upload" or "Import Git Repository"
2. **Upload the `luma-backend-deploy.zip` file** (already created)
3. **OR** if using Git: Set Root Directory to `backend`

## **Step 3: Configure Project**
- **Project Name**: `luma-backend-api` (or your preferred name)
- **Framework Preset**: Node.js
- **Build Command**: (leave empty)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`
- **Root Directory**: (leave empty - files are at root)

## **Step 4: Environment Variables (Optional)**
Add these if needed:
- `NODE_ENV`: `production`
- `VERCEL`: `true`

## **Step 5: Deploy**
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy the generated URL (e.g., `https://luma-backend-api.vercel.app`)

## **Step 6: Update Your App Configuration**
Once deployed, update `src/config/updateServer.ts`:
```typescript
baseUrl: 'https://your-new-backend-url.vercel.app/v1'
```

## **Step 7: Test Your Deployment**
```bash
# Health check
curl https://your-backend-url.vercel.app/v1/health

# Gen 2 updates
curl -X POST https://your-backend-url.vercel.app/v1/updates/gen2 \
  -H "Content-Type: application/json" \
  -d '{"currentVersion":"1.0.0","platform":"ios","deviceId":"test"}'
```

## **Expected Response**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-16T...",
  "version": "1.0.0",
  "updates": ["1.1.0", "1.2.0", "2.0.0"]
}
```

## **Troubleshooting**
- If you get 404 errors, check that `vercel.json` is in the root
- If deployment fails, check the Vercel logs
- Make sure all dependencies are in `package.json`

## **Current Status**
✅ Backend files ready  
✅ Vercel config ready  
✅ Deployment package created  
⏳ Ready for Vercel deployment 