# 🚀 Render.com Deployment - Backend Only

## ⚠️ IMPORTANT: Deploy Backend and Frontend Separately!

You need **TWO separate deployments**:
1. **Backend** on Render.com (Python API)
2. **Frontend** stays on Vercel (React app)

---

## 📦 Step 1: Deploy ONLY Backend on Render

### Method 1: Via GitHub (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Go to https://dashboard.render.com**
   - Sign up / Login

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Click "Connect GitHub" or "Connect GitLab"
   - Select your repository

4. **Configure the Service:**
   ```
   Name: tool-management-backend
   Region: Oregon (or closest to you)
   Branch: main (or your branch name)
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

5. **Select Free Plan**
   - Instance Type: Free
   - Click "Create Web Service"

### Method 2: Upload Folder Directly

If you don't have GitHub:

1. **Compress ONLY the backend folder**
   - Go to `/app/backend`
   - Zip the entire folder
   - Name it `backend.zip`

2. **Go to Render Dashboard**
   - New + → Web Service
   - Choose "Deploy an existing image from a registry" → Skip
   - Or choose manual deploy

3. **Unfortunately, Render requires Git**
   - Best option: Create a GitHub account and push code
   - Or use Railway.app which supports direct uploads

---

## 🔧 Step 2: Add Environment Variables

After creating the service:

1. **Go to your service dashboard on Render**

2. **Click "Environment" in left sidebar**

3. **Add these variables one by one:**

   ```
   Key: MONGO_URL
   Value: mongodb+srv://username:password@cluster.mongodb.net/tool_management?retryWrites=true&w=majority
   
   Key: DB_NAME
   Value: tool_management
   
   Key: SECRET_KEY
   Value: your-secret-key-change-this-randomly-123456789
   
   Key: CORS_ORIGINS
   Value: https://your-vercel-app.vercel.app,http://localhost:3000
   
   Key: PYTHON_VERSION
   Value: 3.11.0
   ```

4. **Click "Save Changes"**
   - Render will automatically redeploy with new variables

5. **Wait for deployment** (~2-3 minutes)

---

## 🗄️ Step 3: Setup MongoDB Atlas

1. **Go to https://cloud.mongodb.com**
   - Sign up for free account

2. **Create Cluster**
   - Choose "M0 Sandbox" (Free Forever)
   - Cloud Provider: AWS
   - Region: Choose closest to your Render region
   - Cluster Name: tool-management
   - Click "Create Cluster" (takes 1-3 minutes)

3. **Create Database User**
   - Left sidebar → "Database Access"
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `admin`
   - Password: Create strong password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IPs**
   - Left sidebar → "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0`
   - Click "Confirm"

5. **Get Connection String**
   - Left sidebar → "Database" → "Clusters"
   - Click "Connect" button
   - Choose "Connect your application"
   - Driver: Python, Version: 3.12 or later
   - Copy the connection string
   - It looks like: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update Connection String**
   - Replace `<password>` with your actual password
   - Add database name: Change `/?retryWrites` to `/tool_management?retryWrites`
   - Final: `mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/tool_management?retryWrites=true&w=majority`

7. **Add to Render Environment Variables**
   - Go back to Render → Environment
   - Update `MONGO_URL` with your connection string
   - Click "Save Changes"

---

## 🌐 Step 4: Update Vercel Frontend

1. **Get Your Render Backend URL**
   - In Render dashboard, find your service URL
   - It looks like: `https://tool-management-backend.onrender.com`
   - Copy this URL

2. **Go to Vercel Dashboard**
   - Select your project
   - Click "Settings" → "Environment Variables"

3. **Add New Variable**
   - Name: `REACT_APP_BACKEND_URL`
   - Value: `https://tool-management-backend.onrender.com` (your Render URL)
   - Environments: Check all boxes (Production, Preview, Development)
   - Click "Save"

4. **Redeploy Vercel**
   - Go to "Deployments" tab
   - Find latest deployment
   - Click "..." → "Redeploy"
   - Wait for completion (~1-2 minutes)

---

## ✅ Step 5: Test Everything

### Test Backend (Render)

1. **Open in browser:** `https://your-backend.onrender.com/docs`
   - Should show FastAPI Swagger documentation
   - If you see this, backend is working! ✅

### Test Frontend (Vercel)

1. **Open your Vercel URL:** `https://your-app.vercel.app`
2. **Try to login:**
   - Username: `admin`
   - Password: `admin123`
3. **Should work!** ✅

---

## 🐛 Troubleshooting

### Issue: "Build failed" on Render

**Check:**
- Is `requirements.txt` in the `/app/backend` folder?
- Root Directory set to `backend`?
- Build command correct?

**Fix:**
- Make sure Root Directory is `backend` not `/app/backend`
- Check Render logs for specific error

### Issue: "Application failed to respond"

**Check Render Logs:**
1. Render Dashboard → Logs
2. Look for errors

**Common fixes:**
- Check all environment variables are set
- Verify MONGO_URL is correct
- Ensure PORT is not hardcoded (use $PORT)

### Issue: Login still fails on Vercel

**Debug steps:**

1. **Open browser DevTools (F12)**
   - Go to Network tab
   - Try to login
   - Look for `/api/auth/login` request
   - Check what URL it's calling

2. **Verify environment variable:**
   - Vercel Settings → Environment Variables
   - Is `REACT_APP_BACKEND_URL` correct?
   - Did you redeploy after adding it?

3. **Check CORS:**
   - Render → Environment
   - `CORS_ORIGINS` should include your Vercel URL
   - Format: `https://your-app.vercel.app` (no trailing slash)

### Issue: CORS Error

**Error in browser console:** "Access blocked by CORS policy"

**Fix:**
1. Render → Environment Variables
2. Update `CORS_ORIGINS`:
   ```
   https://your-exact-vercel-url.vercel.app
   ```
3. No spaces, no trailing slashes
4. Save and wait for redeploy

### Issue: Database connection failed

**Check:**
1. MongoDB Atlas → Network Access → Is `0.0.0.0/0` listed?
2. Connection string → Is password correct? (no < or >)
3. Database name added to connection string?

---

## 📊 Final Architecture

```
User Browser
     ↓
Vercel (Frontend) → https://your-app.vercel.app
     ↓
Render (Backend API) → https://your-backend.onrender.com
     ↓
MongoDB Atlas (Database) → cloud.mongodb.com
```

---

## ⚠️ Important Notes

1. **Render Free Tier:**
   - Spins down after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds
   - Upgrade to paid for always-on

2. **Don't deploy entire `/app` folder to Render**
   - Only deploy `/app/backend` folder
   - Root Directory MUST be `backend`

3. **Files you DON'T need on Render:**
   - `vercel.json` (ignore this, it's for Vercel only)
   - `frontend/` folder (already on Vercel)

4. **Files you DO need on Render:**
   - `backend/server.py`
   - `backend/requirements.txt`
   - `backend/.env` (but use Environment Variables instead)
   - `backend/uploads/` (will be created automatically)

---

## 🎯 Quick Checklist

- [ ] Render account created
- [ ] Backend deployed on Render (Root Dir: `backend`)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP `0.0.0.0/0` whitelisted
- [ ] Connection string obtained and updated
- [ ] All environment variables added to Render
- [ ] Render service is "Live" (green status)
- [ ] Backend docs accessible: `https://your-backend.onrender.com/docs`
- [ ] `REACT_APP_BACKEND_URL` added to Vercel
- [ ] Vercel redeployed
- [ ] Login works on Vercel app

---

## 💡 Alternative: Use Railway.app

If Render is giving you trouble:

1. **Railway.app supports direct uploads**
   - No GitHub required
   - Drag and drop `/app/backend` folder
   - Auto-detects Python

2. **Same steps for environment variables**

3. **Same MongoDB Atlas setup**

---

## 🆘 Still Stuck?

Share:
1. Screenshot of Render error (if any)
2. Your Render service URL
3. Your Vercel app URL
4. Any error messages from browser console

I'll help debug specifically!
