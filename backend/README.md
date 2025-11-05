# DNS Threat Detection API - Backend

Production-grade FastAPI backend for DNS threat detection using the `dns-threat-detector` package.

## Features

- **Authentication**: JWT-based auth with refresh tokens
- **Real-time Scanning**: Single and batch domain analysis
- **Analytics**: Comprehensive dashboard with trends and metrics
- **Safelist Management**: Three-tier safelist system
- **WebSocket Support**: Real-time batch job progress updates
- **Export Capabilities**: PDF reports, CSV/JSON exports
- **Rate Limiting**: Protection against abuse
- **Async Operations**: High-performance async processing

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Initialize Database

```bash
alembic upgrade head
```

### 5. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/      # API endpoints
│   ├── core/            # Config, security, database
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   └── services/        # Business logic
├── alembic/             # Database migrations
├── tests/               # Test suite
├── .env                 # Environment variables
└── requirements.txt     # Dependencies
```

## Testing

```bash
pytest tests/ -v
```

## Deployment

See deployment documentation for production setup instructions.
