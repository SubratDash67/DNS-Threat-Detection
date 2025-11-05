# 🚀 Quick Start Guide - DNS Threat Detection API

## ⚡ Fast Setup (5 minutes)

### Step 1: Navigate to Backend Directory
```powershell
cd C:\Users\KIIT\Desktop\UMUDGA\dns_web_app\backend
```

### Step 2: Run Automated Setup
```powershell
.\start.ps1
```

This script will:
- ✅ Create virtual environment (if needed)
- ✅ Install all dependencies
- ✅ Initialize database with demo users
- ✅ Start the server

### Step 3: Access API
Once server starts, open your browser:
- 📖 **API Documentation**: http://localhost:8000/docs
- 📘 **ReDoc**: http://localhost:8000/redoc
- 🏥 **Health Check**: http://localhost:8000/health

## 🔐 Demo Credentials

```
User Account:
  Email: demo@example.com
  Password: demo123456

Admin Account:
  Email: admin@example.com
  Password: admin123456
```

## 🧪 Quick Test (Using Swagger UI)

1. **Go to**: http://localhost:8000/docs

2. **Login**:
   - Click on `POST /api/auth/login`
   - Click "Try it out"
   - Use demo credentials
   - Click "Execute"
   - Copy the `access_token`

3. **Authorize**:
   - Click the "Authorize" button (🔓 top right)
   - Paste: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"

4. **Scan a Domain**:
   - Click on `POST /api/scan/single`
   - Click "Try it out"
   - Use this JSON:
     ```json
     {
       "domain": "google.com",
       "use_safelist": true
     }
     ```
   - Click "Execute"
   - See the results!

5. **Test Typosquatting Detection**:
   - Same endpoint
   - Use:
     ```json
     {
       "domain": "gooogle.com",
       "use_safelist": true
     }
     ```
   - Should detect as MALICIOUS!

6. **View Dashboard**:
   - Click on `GET /api/analytics/dashboard`
   - Click "Try it out"
   - Click "Execute"
   - See your scan statistics!

## 📝 Manual Setup (Alternative)

If you prefer manual setup:

```powershell
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize database
python init_db.py

# 5. Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔄 Common Commands

### Start Server
```powershell
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Reset Database
```powershell
.\venv\Scripts\Activate.ps1
python init_db.py
```

### Run Tests
```powershell
.\venv\Scripts\Activate.ps1
pytest tests/ -v
```

## 🎯 Next Steps

### Test All Features
1. ✅ Authentication (register, login)
2. ✅ Single domain scanning
3. ✅ Batch scanning
4. ✅ View history
5. ✅ Export data (CSV/JSON)
6. ✅ Analytics dashboard
7. ✅ Safelist management
8. ✅ Model information

### Explore API
- See `API_TESTING_GUIDE.md` for detailed testing
- See `IMPLEMENTATION_SUMMARY.md` for architecture

### Build Frontend
- Backend is ready for integration
- See `DNS_THREAT_DETECTION_WEB_APP_PLAN.txt` for UI design
- Use React + Vite + Material UI

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Use different port
uvicorn app.main:app --reload --port 8001
```

### Module Not Found
```powershell
# Make sure venv is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Locked
```powershell
# Delete and recreate
rm dns_detection.db
python init_db.py
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| `README.md` | Overview and setup |
| `API_TESTING_GUIDE.md` | Detailed API testing |
| `IMPLEMENTATION_SUMMARY.md` | Architecture & design |

## 💡 Tips

1. **Use Swagger UI** for interactive testing
2. **Check logs** in terminal for debugging
3. **Test with demo users** before creating new ones
4. **Export data** to verify functionality
5. **Check analytics** after multiple scans

## ✨ Features Ready

✅ JWT Authentication
✅ Single Domain Scanning
✅ Batch Processing
✅ Real-time Status Tracking
✅ Scan History with Filters
✅ Data Export (CSV/JSON)
✅ Analytics Dashboard
✅ TLD Risk Analysis
✅ Safelist Management (3 tiers)
✅ Model Information API
✅ Auto-generated API Docs
✅ Async Operations
✅ Error Handling
✅ Input Validation

## 🎉 You're Ready!

Backend is **100% complete** and ready for:
1. Testing all endpoints
2. Frontend integration
3. Production deployment (with configuration)

Happy coding! 🚀
