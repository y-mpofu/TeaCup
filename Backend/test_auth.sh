#!/bin/bash
# Backend Authentication Test Script
# Save this as test_auth.sh and run: bash test_auth.sh

echo "🧪 Testing TeaCup Backend Authentication..."
echo "========================================"

BASE_URL="http://localhost:8000"

echo ""
echo "1️⃣ Testing Health Endpoint..."
curl -s "$BASE_URL/api/health/ping" | jq . || echo "Health endpoint failed"

echo ""
echo "2️⃣ Testing Login with user 'exa'..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "exa", "password": "Aa123456"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq . || echo "Login failed or invalid JSON response"

echo ""
echo "3️⃣ Testing Login with user 'exa3'..."
LOGIN_RESPONSE2=$(curl -s -X POST "$BASE_URL/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "exa3", "password": "Aa123456"}')

echo "Login Response for exa3:"
echo "$LOGIN_RESPONSE2" | jq . || echo "Login failed for exa3"

echo ""
echo "4️⃣ Testing Available Endpoints..."
curl -s "$BASE_URL/docs" > /dev/null && echo "✅ Swagger docs accessible at $BASE_URL/docs" || echo "❌ Swagger docs not accessible"

echo ""
echo "5️⃣ Testing Registration Endpoint..."
curl -s -X POST "$BASE_URL/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"username": "test", "email": "test@test.com", "password": "Test123", "first_name": "Test", "last_name": "User", "country_of_interest": "ZW"}' | jq . || echo "Registration endpoint failed"

echo ""
echo "🔍 Diagnosis Complete!"
echo "Check the responses above to see what's working and what's broken."