# Vercel Deployment Guide

## ⚠️ Current Issue
Your application has a **FastAPI Python backend** which Vercel doesn't support. The 404 error occurs because API endpoints aren't available.

## 🚀 Solution: Hybrid Deployment

### Step 1: Deploy Backend on Railway (Free)

1. **Go to Railway.app**
   - Sign up at https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure Backend**
   - Root directory: `/app/backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables in Railway:**
   ```
   MONGO_URL=<your-mongodb-atlas-url>
   DB_NAME=tool_management
   SECRET_KEY=your-secret-key-change-in-production
   CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
   PORT=8000
   ```

4. **Get Your Railway URL**
   - After deployment, copy the URL (e.g., `https://your-app.railway.app`)

### Step 2: Setup MongoDB Atlas (Free)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose free M0 cluster
   - Select region closest to you
   - Name it "tool-management"

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tool_management?retryWrites=true&w=majority`

4. **Whitelist IP Addresses**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)

### Step 3: Update Vercel Frontend

1. **Update Environment Variable in Vercel**
   - Go to your Vercel project settings
   - Environment Variables → Add:
   ```
   REACT_APP_BACKEND_URL=https://your-app.railway.app
   ```

2. **Redeploy Vercel**
   - Go to Deployments → Click "Redeploy"

### Step 4: Update File Uploads (Optional)

Since Railway has ephemeral storage, use Cloudinary for file uploads:

1. **Create Cloudinary Account** (free)
   - https://cloudinary.com

2. **Get API Keys**
   - Dashboard → Settings → Access Keys

3. **Add to Railway Environment Variables:**
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

## 📋 Checklist

- [ ] Backend deployed on Railway
- [ ] MongoDB Atlas cluster created
- [ ] Connection string added to Railway
- [ ] CORS configured with Vercel URL
- [ ] Vercel environment variable updated with Railway URL
- [ ] Vercel redeployed
- [ ] Test login at https://your-app.vercel.app

## 🧪 Testing

After deployment:

1. **Test Frontend**: https://your-app.vercel.app
2. **Test Backend**: https://your-app.railway.app/api/tools (should return 401 unauthorized - this is correct)
3. **Test Login**: Use credentials `admin / admin123`

## 🔍 Troubleshooting

### Issue: CORS Error
**Solution**: Add your Vercel URL to `CORS_ORIGINS` in Railway

### Issue: Database Connection Failed
**Solution**: 
- Check MongoDB Atlas whitelist includes `0.0.0.0/0`
- Verify connection string is correct
- Ensure database user has read/write permissions

### Issue: File Uploads Not Working
**Solution**: 
- Implement Cloudinary integration (I can help with this)
- Or use Railway's persistent volumes (paid feature)

## 💡 Alternative: Full Emergent Deployment

If you prefer a simpler deployment without managing multiple services:

**Deploy on Emergent** (where it was originally built):
- Single platform deployment
- Everything preconfigured
- One-click deploy
- Automatic scaling

Contact Emergent support or use their native deployment features.

## 📞 Need Help?

If you need assistance with any step, let me know and I can:
1. Help configure Railway deployment
2. Update backend code for Cloudinary
3. Create environment variable templates
4. Debug deployment issues
