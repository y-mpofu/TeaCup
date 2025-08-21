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







# #!/bin/bash
# # Backend Search Diagnostic Script
# # Save this as test_search.sh and run: bash test_search.sh

# echo "🔍 Testing TeaCup Backend Search Functionality..."
# echo "================================================"

# BASE_URL="http://localhost:8000"

# echo ""
# echo "1️⃣ Testing if Backend is Running..."
# curl -s "$BASE_URL/" | jq . || echo "❌ Backend not running on $BASE_URL"

# echo ""
# echo "2️⃣ Testing Debug Routes Endpoint..."
# curl -s "$BASE_URL/debug/routes" | jq '.search_routes' || echo "❌ Debug routes not available"

# echo ""
# echo "3️⃣ Testing Search Endpoint (No Auth)..."
# SEARCH_RESPONSE=$(curl -s "$BASE_URL/api/search?q=politics&max_results=5")
# echo "Search Response (No Auth):"
# echo "$SEARCH_RESPONSE" | jq . || echo "❌ Search endpoint failed without auth"

# echo ""
# echo "4️⃣ Testing Login to Get Token..."
# LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
#      -H "Content-Type: application/json" \
#      -d '{"username": "exa", "password": "Aa123456"}')

# echo "Login Response:"
# echo "$LOGIN_RESPONSE" | jq . || echo "❌ Login failed"

# # Extract token if login was successful
# TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

# if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
#     echo ""
#     echo "5️⃣ Testing Search with Authentication Token..."
#     SEARCH_AUTH_RESPONSE=$(curl -s "$BASE_URL/api/search?q=politics&max_results=5" \
#          -H "Authorization: Bearer $TOKEN")
    
#     echo "Search Response (With Auth):"
#     echo "$SEARCH_AUTH_RESPONSE" | jq . || echo "❌ Authenticated search failed"
    
#     echo ""
#     echo "6️⃣ Testing Cache Statistics..."
#     CACHE_STATS=$(curl -s "$BASE_URL/api/cache/stats")
#     echo "Cache Statistics:"
#     echo "$CACHE_STATS" | jq . || echo "❌ Cache stats failed"
    
#     echo ""
#     echo "7️⃣ Testing Different Search Queries..."
#     for query in "health" "sports" "technology" "business"; do
#         echo "   Searching for: $query"
#         curl -s "$BASE_URL/api/search?q=$query&max_results=3" \
#              -H "Authorization: Bearer $TOKEN" | jq '.results_found // "error"'
#     done
    
# else
#     echo "❌ Could not get authentication token - skipping authenticated tests"
# fi

# echo ""
# echo "8️⃣ Testing Search Input Validation..."
# echo "   Testing query too short:"
# curl -s "$BASE_URL/api/search?q=a" | jq '.detail // "no error"'

# echo ""
# echo "   Testing empty query:"
# curl -s "$BASE_URL/api/search?q=" | jq '.detail // "no error"'

# echo ""
# echo "9️⃣ Testing API Documentation..."
# curl -s "$BASE_URL/docs" > /dev/null && echo "✅ API docs accessible at $BASE_URL/docs" || echo "❌ API docs not accessible"

# echo ""
# echo "🔍 Search Diagnosis Complete!"
# echo "=============================="
# echo ""
# echo "WHAT TO CHECK:"
# echo "1. Is the backend running? (Step 1)"
# echo "2. Are search routes registered? (Step 2)" 
# echo "3. Does search work without auth? (Step 3)"
# echo "4. Can you log in? (Step 4)"
# echo "5. Does search work with auth? (Step 5)"
# echo "6. Is the search cache populated? (Step 6)"
# echo "7. Do different search terms work? (Step 7)"
# echo ""
# echo "COMMON ISSUES:"
# echo "• Backend not running: Start with 'uvicorn main:app --reload'"
# echo "• Search routes missing: Make sure search_routes.py is imported in main.py"
# echo "• Empty cache: Search returns web suggestions instead of articles"
# echo "• Auth issues: Check username/password and token handling"
# echo "• CORS errors: Check browser console for frontend errors"