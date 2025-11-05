from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.core.security import get_current_user
from app.models.user import User
from app.services.detector_service import get_detector_service

router = APIRouter(prefix="/api/models", tags=["Models"])


@router.get("/info")
async def get_model_info(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    detector = get_detector_service()
    model_info = detector.get_model_info()

    return model_info


@router.get("/features")
async def get_model_features(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    features = {
        "features": [
            {
                "name": "Domain Length",
                "description": "Character count of the domain",
                "example": "google.com = 10",
                "importance": 0.08,
            },
            {
                "name": "Entropy",
                "description": "Randomness measure of domain characters",
                "example": "High entropy = random characters",
                "importance": 0.15,
            },
            {
                "name": "Vowel-Consonant Ratio",
                "description": "Balance metric between vowels and consonants",
                "example": "Normal domains ≈ 0.4",
                "importance": 0.06,
            },
            {
                "name": "Digit Ratio",
                "description": "Percentage of digits in domain",
                "example": "paypal.com = 0%",
                "importance": 0.09,
            },
            {
                "name": "Special Character Count",
                "description": "Number of hyphens, underscores, etc.",
                "example": "example-site.com = 1",
                "importance": 0.05,
            },
            {
                "name": "Subdomain Count",
                "description": "Number of subdomain levels",
                "example": "sub.example.com = 1",
                "importance": 0.07,
            },
            {
                "name": "TLD Category",
                "description": "Top-level domain classification",
                "example": ".com = safe, .xyz = suspicious",
                "importance": 0.12,
            },
            {
                "name": "N-gram Frequency",
                "description": "Frequency of character patterns",
                "example": "Common patterns = normal",
                "importance": 0.11,
            },
            {
                "name": "Dictionary Word Ratio",
                "description": "Percentage of real words",
                "example": "facebook = 100%",
                "importance": 0.10,
            },
            {
                "name": "Levenshtein Distance",
                "description": "Edit distance to known brands",
                "example": "paypa1.com (close to paypal)",
                "importance": 0.13,
            },
            {
                "name": "Character Bigram Anomaly",
                "description": "Unusual character pair frequency",
                "example": "High anomaly = suspicious",
                "importance": 0.14,
            },
        ],
        "total_features": 11,
        "feature_engineering": "Automated feature extraction from domain strings",
    }

    return features


@router.post("/reload")
async def reload_models(
    current_user: User = Depends(get_current_user),
) -> Dict[str, str]:
    if current_user.role != "admin":
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can reload models",
        )

    detector = get_detector_service()
    detector.reload_models()

    return {"message": "Models reloaded successfully"}
