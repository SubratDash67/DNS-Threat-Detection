# API Testing Guide

This guide provides step-by-step instructions for testing all API endpoints.

## Prerequisites

1. Backend server running: `uvicorn app.main:app --reload`
2. Database initialized: `python init_db.py`

## Demo Credentials

- **User**: demo@example.com / demo123456
- **Admin**: admin@example.com / admin123456

## Testing Workflow

### 1. Authentication

#### Register New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "testpass1234",
    "full_name": "Test User1"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "testpass1234"
  }'
```

Save the `access_token` from the response for subsequent requests.

#### Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsImVtYWlsIjoidGVzdDFAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTc2MjQzMTE0MiwiaWF0IjoxNzYyMzQ0NzQyfQ.U2ewkVSA76i8bF4OXY0WJ9WSvufV8qBfwKN--B7DhL8"
```

### 2. Single Domain Scanning

```bash
curl -X POST http://localhost:8000/api/scan/single \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzYyNDMwOTExLCJpYXQiOjE3NjIzNDQ1MTF9.YqurV_hNjdLjQKcgo2UDP8HYqG5wKlIiKV65M_kdJvQ" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "google.com",
    "use_safelist": true
  }'
```

Test with typosquatting domain:
```bash
curl -X POST http://localhost:8000/api/scan/single \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "gooogle.com",
    "use_safelist": true
  }'
```

### 3. Batch Scanning

```bash
curl -X POST http://localhost:8000/api/scan/batch \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "domains": [
      "google.com",
      "facebook.com",
      "gooogle.com",
      "faceb00k.com",
      "amazon.com"
    ],
    "use_safelist": true
  }'
```

Get batch job status (replace JOB_ID):
```bash
curl -X GET http://localhost:8000/api/scan/batch/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Get batch results:
```bash
curl -X GET http://localhost:8000/api/scan/batch/1/results?page=1&page_size=50 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Scan History

Get history:
```bash
curl -X GET "http://localhost:8000/api/history?page=1&page_size=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Filter by result:
```bash
curl -X GET "http://localhost:8000/api/history?result=MALICIOUS&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Get specific scan:
```bash
curl -X GET http://localhost:8000/api/history/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Export history (CSV):
```bash
curl -X POST "http://localhost:8000/api/history/export?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{}' \
  --output history.csv
```

### 5. Analytics

Dashboard stats:
```bash
curl -X GET http://localhost:8000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Trends (last 30 days):
```bash
curl -X GET "http://localhost:8000/api/analytics/trends?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

TLD analysis:
```bash
curl -X GET http://localhost:8000/api/analytics/tld-analysis \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Activity heatmap:
```bash
curl -X GET http://localhost:8000/api/analytics/heatmap \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Safelist Management

Get safelist domains:
```bash
curl -X GET "http://localhost:8000/api/safelist?tier=tier1&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Add domain to safelist:
```bash
curl -X POST http://localhost:8000/api/safelist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "tier": "tier3",
    "notes": "Verified safe domain"
  }'
```

Bulk import:
```bash
curl -X POST http://localhost:8000/api/safelist/import \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "domains": ["safe1.com", "safe2.com", "safe3.com"],
    "tier": "tier3",
    "source": "manual_import"
  }'
```

Get safelist stats:
```bash
curl -X GET http://localhost:8000/api/safelist/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Export safelist:
```bash
curl -X GET "http://localhost:8000/api/safelist/export?tier=tier1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --output safelist_tier1.csv
```

### 7. Model Information

Get model info:
```bash
curl -X GET http://localhost:8000/api/models/info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Get features:
```bash
curl -X GET http://localhost:8000/api/models/features \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": "demo@example.com",
    "password": "demo123456"
})
token = response.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# Scan domain
response = requests.post(
    f"{BASE_URL}/api/scan/single",
    headers=headers,
    json={"domain": "google.com", "use_safelist": True}
)
print(response.json())

# Get dashboard
response = requests.get(f"{BASE_URL}/api/analytics/dashboard", headers=headers)
print(response.json())
```

## Swagger UI

Access interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

You can test all endpoints directly from the browser!

## Expected Response Codes

- **200**: Success
- **201**: Created
- **202**: Accepted (async operation)
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error
