"""
Comprehensive API Testing Suite for DNS Threat Detection Backend
Tests all endpoints with proper error handling and detailed reporting
"""

import requests
import json
import time
from typing import Dict, Any, Optional

BASE_URL = "http://localhost:8000"
token = None
test_results = {"passed": 0, "failed": 0, "total": 0}


def print_header(title: str):
    """Print formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def print_test(test_num: int, test_name: str):
    """Print test start message"""
    print(f"\n[Test {test_num}] {test_name}")
    print("-" * 70)


def make_request(
    method: str,
    endpoint: str,
    expected_status: int = 200,
    headers: Optional[Dict] = None,
    json_data: Optional[Dict] = None,
    params: Optional[Dict] = None,
) -> tuple[bool, Any]:
    """Make HTTP request with error handling"""
    global test_results
    test_results["total"] += 1

    try:
        url = f"{BASE_URL}{endpoint}"
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=json_data,
            params=params,
            timeout=10,
        )

        print(f"  Status: {response.status_code}", end="")

        if response.status_code == expected_status:
            print(" ✓")
            test_results["passed"] += 1
            try:
                return True, response.json()
            except:
                return True, response.text
        else:
            print(f" ✗ (Expected {expected_status})")
            print(f"  Response: {response.text[:200]}")
            test_results["failed"] += 1
            return False, None

    except requests.exceptions.ConnectionError:
        print(f"  ✗ Connection Error: Is the server running at {BASE_URL}?")
        test_results["failed"] += 1
        return False, None
    except requests.exceptions.Timeout:
        print(f"  ✗ Timeout: Request took too long")
        test_results["failed"] += 1
        return False, None
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        test_results["failed"] += 1
        return False, None


def test_health_check():
    """Test basic health endpoints"""
    print_test(1, "Health Check & API Info")

    success, data = make_request("GET", "/health")
    if success:
        print(f"  Health Status: {data.get('status')}")

    success, data = make_request("GET", "/")
    if success:
        print(f"  API Name: {data.get('name')}")
        print(f"  Version: {data.get('version')}")

    success, data = make_request("GET", "/api/info")
    if success:
        print(f"  Environment: {data.get('environment')}")


def test_authentication():
    """Test authentication endpoints"""
    global token

    print_test(2, "User Registration")
    register_data = {
        "email": f"testuser_{int(time.time())}@example.com",
        "password": "TestPass123!",
        "full_name": "Test User",
    }
    success, data = make_request(
        "POST", "/api/auth/register", 201, json_data=register_data
    )
    if success:
        print(f"  Created User ID: {data.get('id')}")
        print(f"  Email: {data.get('email')}")

    print_test(3, "User Login (Demo Account)")
    login_data = {"email": "demo@example.com", "password": "demo123456"}
    success, data = make_request("POST", "/api/auth/login", json_data=login_data)
    if success:
        token = data.get("access_token")
        print(f"  Token: {token[:50]}...")
        print(f"  Expires: {data.get('expires_in')} seconds")
        return True
    else:
        print("  ✗ Cannot proceed without token")
        return False

    print_test(4, "Get Current User")
    headers = {"Authorization": f"Bearer {token}"}
    success, data = make_request("GET", "/api/auth/me", headers=headers)
    if success:
        print(f"  User ID: {data.get('id')}")
        print(f"  Email: {data.get('email')}")
        print(f"  Role: {data.get('role')}")


def test_scanning(headers: Dict):
    """Test domain scanning endpoints"""
    print_test(5, "Single Domain Scan - Benign (google.com)")
    scan_data = {"domain": "google.com", "use_safelist": True}
    success, data = make_request(
        "POST", "/api/scan/single", headers=headers, json_data=scan_data
    )
    if success:
        print(f"  Domain: {data.get('domain')}")
        print(f"  Prediction: {data.get('prediction')}")
        print(f"  Confidence: {data.get('confidence'):.2%}")
        print(f"  Method: {data.get('method')}")
        print(f"  Latency: {data.get('latency_ms'):.3f} ms")

    print_test(6, "Single Domain Scan - Typosquatting (gooogle.com)")
    scan_data = {"domain": "gooogle.com", "use_safelist": True}
    success, data = make_request(
        "POST", "/api/scan/single", headers=headers, json_data=scan_data
    )
    if success:
        print(f"  Domain: {data.get('domain')}")
        print(f"  Prediction: {data.get('prediction')}")
        print(f"  Confidence: {data.get('confidence'):.2%}")
        print(f"  Typosquatting: {data.get('typosquatting_target')}")

    print_test(7, "Batch Domain Scan")
    batch_data = {
        "domains": [
            "google.com",
            "facebook.com",
            "gooogle.com",
            "faceb00k.com",
            "amazon.com",
        ],
        "use_safelist": True,
    }
    success, data = make_request(
        "POST", "/api/scan/batch", 202, headers=headers, json_data=batch_data
    )
    if success:
        job_id = data.get("id")
        print(f"  Job ID: {job_id}")
        print(f"  Total Domains: {data.get('total_domains')}")
        print(f"  Status: {data.get('status')}")

        time.sleep(2)

        print_test(8, "Get Batch Job Status")
        success, status_data = make_request(
            "GET", f"/api/scan/batch/{job_id}", headers=headers
        )
        if success:
            print(f"  Status: {status_data.get('status')}")
            print(
                f"  Progress: {status_data.get('processed_domains')}/{status_data.get('total_domains')}"
            )
            print(f"  Malicious: {status_data.get('malicious_count')}")
            print(f"  Benign: {status_data.get('benign_count')}")

        time.sleep(2)

        print_test(9, "Get Batch Results")
        success, results = make_request(
            "GET",
            f"/api/scan/batch/{job_id}/results",
            headers=headers,
            params={"page": 1, "page_size": 10},
        )
        if success and isinstance(results, list):
            print(f"  Retrieved {len(results)} results")
            if results:
                print(
                    f"  First Result: {results[0].get('domain')} → {results[0].get('prediction')}"
                )


def test_history(headers: Dict):
    """Test scan history endpoints"""
    print_test(10, "Get Scan History")
    success, data = make_request(
        "GET", "/api/history", headers=headers, params={"page": 1, "page_size": 5}
    )
    if success and isinstance(data, list):
        print(f"  Retrieved {len(data)} scans")
        if data:
            print(f"  Latest: {data[0].get('domain')} ({data[0].get('prediction')})")

    print_test(11, "Filter History - Malicious Only")
    success, data = make_request(
        "GET",
        "/api/history",
        headers=headers,
        params={"result": "MALICIOUS", "page": 1},
    )
    if success and isinstance(data, list):
        print(f"  Malicious Scans: {len(data)}")

    if success and data:
        scan_id = data[0].get("id") if data else 1
        print_test(12, f"Get Specific Scan (ID: {scan_id})")
        success, scan = make_request("GET", f"/api/history/{scan_id}", headers=headers)
        if success:
            print(f"  Domain: {scan.get('domain')}")
            print(f"  Prediction: {scan.get('prediction')}")


def test_analytics(headers: Dict):
    """Test analytics endpoints"""
    print_test(13, "Dashboard Statistics")
    success, data = make_request("GET", "/api/analytics/dashboard", headers=headers)
    if success:
        print(f"  Total Scans: {data.get('total_scans')}")
        print(f"  Unique Domains: {data.get('unique_domains')}")
        print(f"  Threat Rate: {data.get('threat_rate'):.2f}%")
        print(f"  Avg Processing: {data.get('avg_processing_time'):.3f} ms")
        print(
            f"  Today: {data.get('today_scans')} | Week: {data.get('week_scans')} | Month: {data.get('month_scans')}"
        )

    print_test(14, "Scan Trends")
    success, data = make_request(
        "GET", "/api/analytics/trends", headers=headers, params={"days": 7}
    )
    if success and isinstance(data, list):
        print(f"  Trend Data Points: {len(data)}")
        if data:
            print(
                f"  Latest: {data[-1].get('date')} - {data[-1].get('total_scans')} scans"
            )

    print_test(15, "TLD Analysis")
    success, data = make_request("GET", "/api/analytics/tld-analysis", headers=headers)
    if success and isinstance(data, list):
        print(f"  TLDs Analyzed: {len(data)}")
        if data:
            top = data[0]
            print(f"  Top Risk: {top.get('tld')} (Risk: {top.get('risk_score'):.1f}%)")

    print_test(16, "Activity Heatmap")
    success, data = make_request("GET", "/api/analytics/heatmap", headers=headers)
    if success and isinstance(data, list):
        print(f"  Heatmap Data Points: {len(data)}")


def test_safelist(headers: Dict):
    """Test safelist management endpoints"""
    print_test(17, "Get Safelist Domains (User-Added)")
    success, data = make_request(
        "GET", "/api/safelist", headers=headers, params={"page": 1, "page_size": 5}
    )
    if success and isinstance(data, list):
        print(f"  Retrieved {len(data)} user-added safelist domains")
        print(f"  Note: System safelist (143K+ domains) is in memory, not shown here")

    print_test(18, "Add Domain to Safelist")
    safelist_data = {
        "domain": f"test{int(time.time())}.com",
        "tier": "tier3",
        "notes": "Test domain from API testing",
    }
    success, data = make_request(
        "POST", "/api/safelist", 201, headers=headers, json_data=safelist_data
    )
    if success:
        domain_id = data.get("id")
        print(f"  Added Domain ID: {domain_id}")
        print(f"  Domain: {data.get('domain')}")
        print(f"  Tier: {data.get('tier')}")

        print_test(19, "Update Safelist Domain")
        update_data = {"notes": "Updated test notes"}
        success, updated = make_request(
            "PUT", f"/api/safelist/{domain_id}", headers=headers, json_data=update_data
        )
        if success:
            print(f"  Updated Notes: {updated.get('notes')}")

        print_test(20, "Delete Safelist Domain")
        success, _ = make_request(
            "DELETE", f"/api/safelist/{domain_id}", headers=headers
        )
        if success:
            print(f"  Deleted Domain ID: {domain_id}")

    print_test(21, "Safelist Statistics")
    success, data = make_request("GET", "/api/safelist/stats", headers=headers)
    if success:
        print(f"  Total Domains: {data.get('total_domains')}")
        print(
            f"  Tier 1: {data.get('tier1_count')} | Tier 2: {data.get('tier2_count')} | Tier 3: {data.get('tier3_count')}"
        )
        print(f"  Recently Added: {data.get('recently_added')}")
        print(f"  Hit Rate: {data.get('safelist_hit_rate', 0):.2f}%")


def test_models(headers: Dict):
    """Test model information endpoints"""
    print_test(22, "Model Information")
    success, data = make_request("GET", "/api/models/info", headers=headers)
    if success:
        print(f"  Version: {data.get('version', 'N/A')}")
        if "performance" in data:
            perf = data["performance"]
            print(f"  F1-Score: {perf.get('f1_score', 0):.4f}")
            print(f"  Accuracy: {perf.get('accuracy', 0):.4f}")
        if "safelist" in data:
            print(f"  Safelist Domains: {data['safelist'].get('total_domains', 0)}")

    print_test(23, "Model Features")
    success, data = make_request("GET", "/api/models/features", headers=headers)
    if success:
        features = data.get("features", [])
        print(f"  Total Features: {len(features)}")
        if features:
            print(
                f"  Top Feature: {features[0].get('name')} (Importance: {features[0].get('importance')})"
            )


def test_error_handling(headers: Dict):
    """Test error handling and edge cases"""
    print_test(24, "Invalid Domain Scan")
    success, data = make_request(
        "POST",
        "/api/scan/single",
        422,
        headers=headers,
        json_data={"domain": "", "use_safelist": True},
    )

    print_test(25, "Invalid Authentication")
    bad_headers = {"Authorization": "Bearer invalid_token_12345"}
    success, data = make_request("GET", "/api/auth/me", 401, headers=bad_headers)

    print_test(26, "Non-existent Endpoint")
    success, data = make_request("GET", "/api/nonexistent", 404, headers=headers)


def main():
    """Main test execution"""
    print_header("DNS THREAT DETECTION API - COMPREHENSIVE TEST SUITE")
    print(f"Testing against: {BASE_URL}")
    print(f"Started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    test_health_check()

    if not test_authentication():
        print("\n✗ Authentication failed. Cannot proceed with remaining tests.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    test_scanning(headers)
    test_history(headers)
    test_analytics(headers)
    test_safelist(headers)
    test_models(headers)
    test_error_handling(headers)

    print_header("TEST SUMMARY")
    print(f"  Total Tests: {test_results['total']}")
    print(f"  Passed: {test_results['passed']} ✓")
    print(f"  Failed: {test_results['failed']} ✗")
    success_rate = (
        (test_results["passed"] / test_results["total"] * 100)
        if test_results["total"] > 0
        else 0
    )
    print(f"  Success Rate: {success_rate:.1f}%")

    if test_results["failed"] == 0:
        print("\n  🎉 ALL TESTS PASSED! Backend is fully operational.")
    else:
        print(f"\n  ⚠️  {test_results['failed']} test(s) failed. Review errors above.")

    print("=" * 70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest suite interrupted by user.")
    except Exception as e:
        print(f"\n\n✗ Unexpected error: {str(e)}")
