from typing import Optional, Dict, Any
import time
import logging
from functools import lru_cache
from dns_threat_detector import DNS_ThreatDetector

# Configure logging
logger = logging.getLogger(__name__)


class DetectorService:
    _instance: Optional["DetectorService"] = None
    _detector: Optional[DNS_ThreatDetector] = None
    _safelist_cache: Dict[str, bool] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DetectorService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._detector is None:
            self._load_models()

    def _load_models(self):
        logger.info("Loading DNS Threat Detector models...")
        try:
            self._detector = DNS_ThreatDetector(use_safelist=True)
            self._detector.load_models()
            logger.info("Models loaded successfully")

            if hasattr(self._detector, "safelist") and self._detector.safelist:
                for domain in self._detector.safelist:
                    self._safelist_cache[domain.lower()] = True
                logger.info(f"Safelist loaded: {len(self._safelist_cache)} domains")
        except Exception as e:
            logger.error(f"Error loading DNS Threat Detector models: {str(e)}")
            logger.warning("Continuing without ML models - safelist-only mode")
            # Set detector to None to indicate models aren't available
            self._detector = None

    def predict_single(self, domain: str, use_safelist: bool = True) -> Dict[str, Any]:
        start_time = time.time()

        # Check safelist cache first (works even without ML models)
        if use_safelist and self._check_safelist_cache(domain):
            latency = (time.time() - start_time) * 1000
            return {
                "domain": domain,
                "prediction": "BENIGN",
                "confidence": 1.0,
                "method": "safelist",
                "reason": "Domain found in safelist",
                "stage": "safelist_check",
                "latency_ms": latency,
                "safelist_tier": self._get_safelist_tier(domain),
            }

        # If models aren't loaded, return a default response
        if not self._detector:
            latency = (time.time() - start_time) * 1000
            logger.warning(
                f"ML models not available - returning SUSPICIOUS for {domain}"
            )
            return {
                "domain": domain,
                "prediction": "SUSPICIOUS",
                "confidence": 0.5,
                "method": "default",
                "reason": "ML models not available - manual review recommended",
                "stage": "fallback",
                "latency_ms": latency,
                "typosquatting_target": None,
                "edit_distance": None,
                "safelist_tier": None,
                "features": None,
            }

        result = self._detector.predict(domain)

        # Log result for debugging if needed
        logger.debug(f"Prediction result for {domain}: {result}")

        return {
            "domain": domain,
            "prediction": result.get("prediction", "UNKNOWN"),
            "confidence": result.get("confidence", 0.0),
            "method": result.get("method", "unknown"),
            "reason": result.get("reason", ""),
            "stage": result.get("stage", "ml_prediction"),
            "latency_ms": result.get("latency_ms", 0.0),
            "typosquatting_target": result.get("typosquatting_target"),
            "edit_distance": result.get("edit_distance"),
            "safelist_tier": result.get("safelist_tier"),
            "features": self._extract_features(result),
        }

    def _check_safelist_cache(self, domain: str) -> bool:
        return domain.lower() in self._safelist_cache

    def _get_safelist_tier(self, domain: str) -> Optional[str]:
        if not self._detector or not hasattr(self._detector, "safelist_tiers"):
            return None

        domain_lower = domain.lower()
        safelist_tiers = self._detector.safelist_tiers

        # Handle both dict and list types
        if isinstance(safelist_tiers, dict):
            for tier, domains in safelist_tiers.items():
                if isinstance(domains, (list, set)) and domain_lower in domains:
                    return tier
                elif isinstance(domains, dict) and domain_lower in domains:
                    return tier

        return None

    def _extract_features(self, result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Extract features from prediction result"""
        if "features" in result:
            return result["features"]
        return None

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        if not self._detector:
            logger.warning("Models not loaded - returning fallback info")
            return {
                "version": "1.0.0",
                "status": "models_not_loaded",
                "message": "ML models not available - running in safelist-only mode",
                "components": ["LSTM", "LightGBM", "Meta-learner"],
                "safelist": {
                    "enabled": True,
                    "total_domains": len(self._safelist_cache),
                },
            }

        try:
            info = self._detector.get_model_info()
            return info
        except Exception as e:
            logger.error(f"Error getting model info: {str(e)}")
            return {
                "version": "1.0.0",
                "error": str(e),
                "components": ["LSTM", "LightGBM", "Meta-learner"],
                "safelist": {
                    "enabled": True,
                    "total_domains": len(self._safelist_cache),
                },
            }

    def reload_models(self):
        """Reload all models and clear cache"""
        logger.info("Reloading models...")
        self._detector = None
        self._safelist_cache.clear()
        self._load_models()
        logger.info("Models reloaded successfully")


@lru_cache()
def get_detector_service() -> DetectorService:
    return DetectorService()
