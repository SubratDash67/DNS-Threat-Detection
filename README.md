# DNS Threat Detection Web Application

![DNS Security](https://img.shields.io/badge/DNS-Security-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack web application for real-time DNS threat detection using advanced AI and machine learning techniques. Detects malicious, suspicious, and benign domains with high accuracy using ensemble learning.

## 🌟 Features

### 🔍 **3-Tier Classification System**
- **BENIGN** (Green): Safe, trusted domains
- **SUSPICIOUS** (Amber): Grey-area domains with phishing indicators
- **MALICIOUS** (Red): Confirmed threats

### 🚀 **Core Capabilities**
- **Single Domain Scan**: Real-time analysis with instant results
- **Batch Processing**: Upload and scan up to 10,000 domains simultaneously
- **Advanced Detection Methods**:
  - Safelist checking (tier-based)
  - Brand whitelist protection
  - Typosquatting detection
  - Suspicious pattern matching (NEW in v1.0.4)
  - ML Ensemble (LSTM + LightGBM + Meta-learner)

### 📊 **Analytics & Insights**
- Real-time dashboard with key metrics
- Trend analysis (7/14/30/90 days)
- TLD risk analysis
- Activity heatmaps
- Scan history with filtering

### 🛡️ **Security Features**
- JWT authentication
- Role-based access control (User/Admin)
- User profile management
- Safelist management (3 tiers)
- Export capabilities (CSV/JSON)

## 🏗️ Architecture

```
dns_web_app/
├── backend/              # FastAPI REST API
│   ├── alembic/         # Database migrations
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Config, security, database
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic (detector)
│   └── static/          # Static files (avatars)
│
└── frontend/            # React + TypeScript + Vite
    ├── src/
    │   ├── api/         # API client
    │   ├── components/  # Reusable UI components
    │   ├── context/     # React context (Auth, Theme, Notifications)
    │   ├── hooks/       # Custom React hooks
    │   ├── layouts/     # Page layouts
    │   ├── pages/       # Application pages
    │   ├── routes/      # React Router setup
    │   ├── store/       # State management
    │   ├── styles/      # Global styles
    │   └── utils/       # Utility functions
    └── public/          # Static assets
```

## 🔧 Technology Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT (python-jose)
- **ML Package**: dns-threat-detector v1.0.4 (PyPI)
- **Models**: PyTorch 2.0+, LightGBM 4.0+
- **Migrations**: Alembic

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS + Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Populate safelist (optional)
python populate_safelist.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with backend API URL

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Default Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 📖 API Documentation

### Authentication
```bash
# Register new user
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "John Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Scanning
```bash
# Single domain scan
POST /api/scan/single
{
  "domain": "example.com",
  "use_safelist": true
}

# Batch scan
POST /api/scan/batch
{
  "domains": ["example1.com", "example2.com"],
  "use_safelist": true
}

# Get batch status
GET /api/scan/batch/{job_id}
```

### Analytics
```bash
# Dashboard stats
GET /api/analytics/dashboard

# Trends (last N days)
GET /api/analytics/trends?days=30

# TLD analysis
GET /api/analytics/tld-analysis
```

## 🧪 Testing

### Test Domains

**BENIGN:**
- `google.com`
- `microsoft.com`
- `github.com`

**SUSPICIOUS:**
- `amazoncustomer.support`
- `paypal-helpdesk.net`
- `slack-support.com`
- `netflix-refund.help`

**MALICIOUS:**
- `gooooogle.com` (character repetition)
- `micros0ft.com` (typosquatting)

## 🔄 Recent Updates (v1.0.4)

### ✨ New Features
- **3-Tier Classification**: Added SUSPICIOUS category for grey-area domains
- **Suspicious Detection Rules**: Brand + service token detection
- **Enhanced UI**: Amber color scheme for suspicious domains
- **Method Formatting**: User-friendly display names (e.g., "Suspicious Rule")

### 🐛 Bug Fixes
- Fixed Badge component to properly display SUSPICIOUS results
- Fixed SQLite migration compatibility issues
- Updated batch scan to track suspicious_count

### 📝 Database Changes
- Added `suspicious_count` column to `batch_jobs` table
- Migration: `003_add_suspicious_count.py`

## 📊 Detection Methods

1. **Safelist Check**: O(1) lookup in tier-based safelist
2. **Brand Whitelist**: Protects legitimate brands
3. **Typosquatting Rules**: Levenshtein distance + edit distance
4. **Suspicious Detection**: Brand + service token + TLD analysis (NEW)
5. **ML Ensemble**: LSTM + LightGBM + Meta-learner

## 🎨 UI Components

### Pages
- **Landing**: Public homepage
- **Login/Register**: Authentication
- **Dashboard**: Overview with real-time stats
- **Single Scan**: Individual domain analysis
- **Batch Scan**: Bulk domain processing
- **History**: Scan history with filters
- **Analytics**: Comprehensive analytics dashboard
- **Safelist**: Manage trusted domains
- **Profile**: User settings and password change
- **Model Info**: ML model details

### Charts
- Line Chart (Trends)
- Donut Chart (Distribution)
- Bar Chart (TLD Analysis)
- Heatmap (Activity patterns)
- Radar Chart (Feature analysis)

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt
- SQL injection protection (SQLAlchemy ORM)
- XSS protection (React)
- CORS configuration
- Environment variable secrets

## 📦 Deployment

### Backend (Production)
```bash
# Install production dependencies
pip install -r requirements.txt

# Set production environment
export ENV=production

# Use production ASGI server
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Production)
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to hosting service
```

### Recommended Hosting
- **Backend**: Railway, Render, Heroku, AWS EC2
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: PostgreSQL (for production), SQLite (for dev)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Subrat Dash** - [SubratDash67](https://github.com/SubratDash67)

## 🙏 Acknowledgments

- dns-threat-detector package (PyPI v1.0.4)
- FastAPI framework
- React & Material-UI
- PyTorch & LightGBM communities

## 📞 Support

For support, email support@example.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] PostgreSQL support
- [ ] Real-time WebSocket updates
- [ ] Advanced reporting (PDF generation)
- [ ] API rate limiting
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Mobile responsive improvements
- [ ] Docker containerization
- [ ] Kubernetes deployment configs

---

**Note**: This application is for educational and research purposes. Always verify domain safety through multiple sources before making security decisions.
