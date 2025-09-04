#!/bin/bash

# Test script to verify auth endpoints are working
echo "🔍 Testing Auth Endpoints..."

# Set your API base URL
API_BASE="http://localhost:3000/api/v1/auth"

echo ""
echo "1. Testing /profile endpoint (should return 401 without token):"
curl -X GET "$API_BASE/profile" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "2. Testing /me endpoint (should return 401 without token):"
curl -X GET "$API_BASE/me" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "3. Testing /logout endpoint (should return 401 without token):"
curl -X POST "$API_BASE/logout" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "test"}' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "4. Testing /refresh endpoint (should return 401 with invalid token):"
curl -X POST "$API_BASE/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "invalid_token"}' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "✅ Auth endpoints test completed!"
echo ""
echo "Expected results:"
echo "- /profile: 401 Unauthorized (no token)"
echo "- /me: 401 Unauthorized (no token)" 
echo "- /logout: 401 Unauthorized (no token)"
echo "- /refresh: 401 Unauthorized (invalid token)"
echo ""
echo "If you see 404 errors, the endpoints don't exist."
echo "If you see 401 errors, the endpoints exist but need authentication."
