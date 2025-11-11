# 📍 EXACTLY Where to Update Vercel Environment Variable

## 🎯 Step-by-Step with Exact Locations

### Step 1: Go to Vercel Dashboard

1. **Open:** https://vercel.com/dashboard
2. **Login** to your account
3. You'll see list of your projects

### Step 2: Select Your Project

1. **Find your project** in the list
   - It's the one showing your app name
   - Should say "Production" and show your URL
2. **Click on the project card** to open it

### Step 3: Go to Settings

1. **Look at the top navigation tabs:**
   ```
   [Overview] [Deployments] [Analytics] [Settings] [...]
   ```
2. **Click "Settings"** (4th tab)

### Step 4: Find Environment Variables

1. **On the left sidebar, you'll see:**
   ```
   General
   Domains
   Environment Variables  ← Click this one!
   Git
   Functions
   ...
   ```

2. **Click "Environment Variables"**

### Step 5: Add the Variable

1. **You'll see a form:**
   ```
   ┌─────────────────────────────────────┐
   │ Add New                             │
   │                                     │
   │ Key                                 │
   │ [___________________________]       │
   │                                     │
   │ Value                               │
   │ [___________________________]       │
   │                                     │
   │ Environments:                       │
   │ ☐ Production                        │
   │ ☐ Preview                           │
   │ ☐ Development                       │
   │                                     │
   │           [Save]                    │
   └─────────────────────────────────────┘
   ```

2. **Fill in:**
   
   **Key:** (type exactly)
   ```
   REACT_APP_BACKEND_URL
   ```
   
   **Value:** (your backend URL from Render/Railway)
   ```
   https://your-backend-app.onrender.com
   ```
   OR
   ```
   https://your-backend-app.up.railway.app
   ```
   
   **Environments:** (check ALL three boxes)
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. **Click "Save"** button

### Step 6: Redeploy

**After saving the environment variable:**

1. **Click "Deployments"** tab (at the top)

2. **Find the latest deployment** (top of the list)

3. **Click the "..." (three dots)** on the right side

4. **Select "Redeploy"** from dropdown menu

5. **Click "Redeploy"** in the confirmation dialog

6. **Wait 1-2 minutes** for deployment to complete
   - You'll see: Building → Deploying → Ready

7. **Visit your Vercel URL** and try to login!

---

## 📸 Visual Guide (Text Version)

```
Vercel Dashboard
    ↓
Your Project (click)
    ↓
Settings Tab (top navigation)
    ↓
Environment Variables (left sidebar)
    ↓
Add New Variable (form)
    ↓
Key: REACT_APP_BACKEND_URL
Value: https://your-backend.onrender.com
Environments: ✅ All three
    ↓
Save
    ↓
Deployments Tab (top navigation)
    ↓
Latest deployment → ... → Redeploy
    ↓
Wait for completion
    ↓
Test login! ✅
```

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Wrong Key Name
```
❌ BACKEND_URL
❌ REACT_BACKEND_URL
❌ API_URL
✅ REACT_APP_BACKEND_URL (must be exact!)
```

### Mistake 2: Wrong Value Format
```
❌ your-backend.onrender.com (missing https://)
❌ https://your-backend.onrender.com/ (trailing slash)
✅ https://your-backend.onrender.com (correct!)
```

### Mistake 3: Not Checking All Environments
```
❌ Only Production checked
✅ All three checked (Production, Preview, Development)
```

### Mistake 4: Forgetting to Redeploy
```
❌ Save variable and immediately test
✅ Save variable → Redeploy → Then test
```

---

## 🔍 How to Verify It's Set Correctly

### Method 1: Check in Vercel Dashboard

1. Go to Settings → Environment Variables
2. You should see:
   ```
   REACT_APP_BACKEND_URL = https://your-backend.onrender.com
   Environments: Production, Preview, Development
   ```

### Method 2: Check in Browser Console

1. Open your Vercel app
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Type:
   ```javascript
   console.log(process.env.REACT_APP_BACKEND_URL)
   ```
5. Should show your backend URL

### Method 3: Check Network Tab

1. Open your Vercel app
2. Press F12 → Network tab
3. Try to login
4. Look for request to `/api/auth/login`
5. Click on it → Headers tab
6. Request URL should show your backend URL

---

## 📋 Quick Reference Card

**Save this info:**

```
Where to update:
├─ Website: https://vercel.com/dashboard
├─ Project: [Your project name]
├─ Tab: Settings
├─ Section: Environment Variables
└─ Action: Add New

Variable Details:
├─ Key: REACT_APP_BACKEND_URL
├─ Value: https://your-backend.onrender.com
└─ Environments: All three boxes checked

After saving:
├─ Go to: Deployments tab
├─ Select: Latest deployment
├─ Click: ... → Redeploy
└─ Wait: 1-2 minutes
```

---

## 🆘 Troubleshooting

### Can't find Settings tab?
- Make sure you clicked on the project first
- You should be INSIDE the project, not on the main dashboard

### Can't find Environment Variables?
- Look at the LEFT sidebar (not top navigation)
- Scroll down if needed
- It's usually 3rd or 4th item in the sidebar

### Variable not showing after save?
- Refresh the page
- The variable should appear in the list below the form

### Redeploy button not working?
- Try clicking the deployment first to open details
- Look for "Redeploy" button in the deployment details page

### Still showing login error after redeploy?
- Wait 2-3 minutes for DNS to propagate
- Clear browser cache (Ctrl+Shift+Delete)
- Try in incognito/private window
- Check that backend is running (visit backend-url/docs)

---

## ✅ Success Checklist

Before testing login, verify:

- [ ] Variable added: REACT_APP_BACKEND_URL
- [ ] Value is correct: https://your-backend.onrender.com
- [ ] No typos in key name
- [ ] No trailing slash in value
- [ ] All three environments checked
- [ ] Variable saved successfully
- [ ] Vercel redeployed
- [ ] Deployment shows "Ready" status
- [ ] Backend is running (check backend-url/docs)
- [ ] Waited 2-3 minutes after redeploy

If ALL checked → Login should work! ✅

---

## 💡 Pro Tips

1. **Use exact copy-paste:**
   - Copy variable name: `REACT_APP_BACKEND_URL`
   - Don't type manually (avoid typos)

2. **Test backend first:**
   - Before updating Vercel
   - Visit: https://your-backend.onrender.com/docs
   - Should show FastAPI documentation

3. **Double-check URL:**
   - No spaces at start or end
   - Starts with https://
   - No trailing slash

4. **Clear cache:**
   - After redeploy, open in incognito
   - Avoids cached old version

5. **Keep a note:**
   - Save your backend URL somewhere
   - You might need it later for debugging

---

## 🎯 Expected Result

After completing all steps:

1. **Visit your Vercel app:** https://your-app.vercel.app
2. **See login page** ✅
3. **Enter credentials:**
   - Username: admin
   - Password: admin123
4. **Click Sign In**
5. **Should redirect to Dashboard** ✅
6. **See sidebar with navigation** ✅

**If you see the dashboard → SUCCESS!** 🎉

---

## 📞 Still Need Help?

If it's still not working, share:

1. **Screenshot of Environment Variables page** (hide the value for security)
2. **Your backend URL** (so I can check if it's accessible)
3. **Error message from browser console** (F12 → Console tab)
4. **Deployment status** (is it "Ready" or "Failed"?)

I'll help you debug!
