# 🚀 Deployment Guide

Complete step-by-step guide to deploy the DNS Threat Detection Web App to production.

## 📋 Overview

- **Backend**: Render (FastAPI + Python)
- **Frontend**: Vercel (React + TypeScript)
- **Database**: SQLite (bundled with backend)

---

## 🔧 Prerequisites

Before deploying, ensure you have:

1. ✅ GitHub account with the repository pushed
2. ✅ [Render account](https://render.com) (free tier available)
3. ✅ [Vercel account](https://vercel.com) (free tier available)
4. ✅ Git installed locally

---

## 📦 Part 1: Deploy Backend to Render

### Step 1: Create Render Account & New Web Service

1. Go to [https://render.com](https://render.com)
2. Sign up or login (GitHub OAuth recommended)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository: `DNS-Threat-Detection`
5. Grant Render access to the repository

### Step 2: Configure Web Service

**Basic Settings:**
- **Name**: `dns-threat-detector-api` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r requirements.txt && alembic upgrade head
  ```
- **Start Command**:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

**Instance Type:**
- Select **Free** tier (or Starter $7/month for better performance)

### Step 3: Environment Variables

Click **"Advanced"** and add these environment variables:

```bash
# Required
SECRET_KEY=your-super-secret-key-min-32-characters-CHANGE-THIS
ENV=production
DATABASE_URL=sqlite+aiosqlite:///./dns_security.db

# CORS - Add your Vercel frontend URL (update after frontend deployment)
ALLOWED_ORIGINS=https://your-frontend-app.vercel.app

# Optional (defaults are fine)
MAX_BATCH_SIZE=10000
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

> **⚠️ IMPORTANT**: Generate a strong SECRET_KEY:
> ```bash
> python -c "import secrets; print(secrets.token_urlsafe(32))"
> ```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build and deployment
3. Monitor the logs in the Render dashboard
4. Once deployed, you'll get a URL like: `https://dns-threat-detector-api.onrender.com`

### Step 5: Verify Backend

Test your backend API:
```bash
# Health check
curl https://your-backend-app.onrender.com/health

# API info
curl https://your-backend-app.onrender.com/api/info

# API docs
# Visit: https://your-backend-app.onrender.com/docs
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": 1730000000.123
}
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account & Import Project

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or login (GitHub OAuth recommended)
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository: `DNS-Threat-Detection`
5. Grant Vercel access to the repository

### Step 2: Configure Project

**Framework Preset**: Vite  
**Root Directory**: `frontend`  
**Build Settings**:
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 3: Environment Variables

Click **"Environment Variables"** and add:

```bash
# Production Backend URL (from Render Step 4)
VITE_API_BASE_URL=https://dns-threat-detector-api.onrender.com

# WebSocket URL (same but with wss://)
VITE_WS_BASE_URL=wss://dns-threat-detector-api.onrender.com
```

> **📝 Note**: Replace `your-backend-app` with your actual Render app name

**Environment**: Select **Production** (and optionally Preview, Development)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. Monitor the build logs
4. Once deployed, you'll get a URL like: `https://your-app.vercel.app`

### Step 5: Verify Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the DNS Threat Detection landing page
3. Try to login with default credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

---

## 🔄 Part 3: Connect Frontend & Backend (CORS)

### Update Backend CORS Settings

1. Go back to **Render Dashboard**
2. Select your backend web service
3. Go to **"Environment"** tab
4. Update the `ALLOWED_ORIGINS` variable:
   ```bash
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app,https://your-custom-domain.com
   ```
   > Include all Vercel preview URLs and custom domains
5. Click **"Save Changes"**
6. Render will automatically redeploy with new settings

### Update Frontend API URL (if needed)

1. Go to **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify `VITE_API_BASE_URL` points to your Render backend
5. If changed, redeploy from **Deployments** tab

---

## 🧪 Testing the Deployment

### 1. Test Backend API
```bash
# Health check
curl https://your-backend-app.onrender.com/health

# Register a user
curl -X POST https://your-backend-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

### 2. Test Frontend
1. Visit: `https://your-app.vercel.app`
2. Register a new account or login
3. Try scanning a domain:
   - **BENIGN**: `google.com`
   - **SUSPICIOUS**: `paypal-helpdesk.net`
   - **MALICIOUS**: `gooooogle.com`
4. Check dashboard analytics
5. Try batch scan with a CSV file

### 3. Test Integration
- Verify API calls work (check Network tab in DevTools)
- Ensure authentication persists across page refreshes
- Test file uploads (batch scan)
- Verify charts and analytics load correctly

---

## 🔐 Post-Deployment Security

### 1. Update Default Credentials
**IMPORTANT**: Change default admin password immediately!

1. Login to frontend: `admin@example.com` / `admin123`
2. Go to **Profile** → **Change Password**
3. Set a strong password

### 2. Generate New Secret Keys
```bash
# Generate a new SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Update in Render environment variables
```

### 3. Set Up Custom Domains (Optional)

**Backend (Render):**
1. Go to Settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

**Frontend (Vercel):**
1. Go to Settings → Domains
2. Add your domain (e.g., `app.yourdomain.com`)
3. Update DNS records as instructed

---

## 🔄 Continuous Deployment

Both Render and Vercel automatically deploy on git push:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Render and Vercel will auto-deploy
```

**Monitor deployments:**
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard

---

## 📊 Monitoring & Logs

### Backend Logs (Render)
1. Go to Render Dashboard
2. Select your web service
3. Click **"Logs"** tab
4. View real-time logs

### Frontend Logs (Vercel)
1. Go to Vercel Dashboard
2. Select your project
3. Click on a deployment
4. View build logs and runtime logs

### Health Checks
- Backend: `https://your-backend-app.onrender.com/health`
- Frontend: Check browser console for errors

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Build fails on Render
```
Error: No module named 'dns_threat_detector'
```
**Solution**: 
- Ensure `dns-threat-detector==1.0.4` is in `requirements.txt`
- Check build logs for pip install errors
- Try manual deploy: Render Dashboard → Manual Deploy

**Issue**: Database not initialized
```
Error: no such table: users
```
**Solution**:
- Check if `alembic upgrade head` runs in build command
- Manually run migrations: Render Dashboard → Shell
  ```bash
  cd backend
  alembic upgrade head
  ```

**Issue**: CORS errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Update `ALLOWED_ORIGINS` in Render to include Vercel URL
- Include both production and preview URLs
- Redeploy backend after updating

### Frontend Issues

**Issue**: API calls fail with 404
```
Error: Cannot connect to backend
```
**Solution**:
- Verify `VITE_API_BASE_URL` in Vercel environment variables
- Check if backend is running: visit `/health` endpoint
- Ensure no trailing slash in API URL

**Issue**: Build fails on Vercel
```
Error: Cannot find module '@mui/material'
```
**Solution**:
- Check `package.json` dependencies
- Clear Vercel build cache: Settings → General → Clear Build Cache
- Redeploy

**Issue**: Environment variables not working
```
VITE_API_BASE_URL is undefined
```
**Solution**:
- Vercel requires redeploy after env var changes
- Ensure variable names start with `VITE_`
- Set variables for all environments (Production, Preview, Development)

### Performance Issues

**Issue**: Backend slow on free tier
**Solution**:
- Render free tier sleeps after 15min inactivity
- Upgrade to Starter plan ($7/month) for always-on
- Or use cron job to ping every 10min (external service)

**Issue**: Large model loading time
**Solution**:
- Pre-load detector on startup (already implemented)
- Consider using Render disk storage for model cache
- Upgrade to higher tier for better performance

---

## 💰 Cost Breakdown

### Free Tier (Both Services)
- **Render Free**: 
  - 750 hours/month
  - Sleeps after 15min inactivity
  - Limited to 512MB RAM
  - Shared CPU
  
- **Vercel Free**:
  - 100GB bandwidth/month
  - 100 builds/month
  - Unlimited team members
  - Automatic HTTPS

**Total Cost**: $0/month (with limitations)

### Paid Tier (Recommended for Production)
- **Render Starter**: $7/month
  - Always-on
  - 1GB RAM
  - Dedicated CPU
  
- **Vercel Pro**: $20/month (optional)
  - 1TB bandwidth
  - Unlimited builds
  - Advanced analytics

**Total Cost**: $7-27/month

---

## 📱 Mobile Responsiveness

The app is mobile-responsive out of the box:
- Responsive design with Material-UI
- Touch-friendly controls
- Mobile-optimized charts
- Works on tablets and phones

Test on mobile: `https://your-app.vercel.app`

---

## 🔒 SSL/HTTPS

Both Render and Vercel provide automatic HTTPS:
- ✅ SSL certificates auto-generated
- ✅ HTTP automatically redirects to HTTPS
- ✅ Certificates auto-renew
- ✅ No configuration needed

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

## ✅ Deployment Checklist

**Before Deployment:**
- [ ] Push latest code to GitHub
- [ ] Update `SECRET_KEY` in backend `.env.example`
- [ ] Test locally (backend + frontend)
- [ ] Commit and push all changes

**Backend (Render):**
- [ ] Create web service
- [ ] Set environment variables
- [ ] Configure build and start commands
- [ ] Deploy and test `/health` endpoint
- [ ] Verify `/docs` API documentation

**Frontend (Vercel):**
- [ ] Import project from GitHub
- [ ] Set `VITE_API_BASE_URL` environment variable
- [ ] Deploy and test homepage
- [ ] Test login functionality
- [ ] Test domain scanning

**Post-Deployment:**
- [ ] Update backend CORS with Vercel URL
- [ ] Change default admin password
- [ ] Test full user flow
- [ ] Monitor logs for errors
- [ ] Set up custom domains (optional)

---

## 🎉 Success!

Your DNS Threat Detection Web App is now live!

- **Backend API**: `https://your-backend-app.onrender.com`
- **Frontend App**: `https://your-app.vercel.app`
- **API Docs**: `https://your-backend-app.onrender.com/docs`

**Share your deployment** and start detecting DNS threats! 🚀

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs (Render + Vercel)
3. Open an issue on GitHub
4. Contact support: support@example.com

**Happy Deploying!** 🎊
