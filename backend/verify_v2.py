from dns_threat_detector import DNS_ThreatDetector

# Verify v2.0.0 installation
detector = DNS_ThreatDetector()
info = detector.get_model_info()

print("=" * 60)
print("DNS Threat Detector - Backend Verification")
print("=" * 60)
print(f"Version: {info['version']}")
print(f"LightGBM Features: {info['components']['lgbm']['features']}")
print(f"Improvements:")
print(f"  - Removed hardcoded lines: {info['improvements']['removed_hardcoded_lines']}")
print(f"  - Edge case accuracy: {info['improvements']['edge_case_accuracy']}")
print(f"  - False positive rate: {info['improvements']['false_positive_rate']}")
print("=" * 60)
print("✓ Backend ready for v2.0.0!")
