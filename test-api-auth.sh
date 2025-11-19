#!/bin/bash
set -e

BASE_URL="http://localhost:3001"
API_BASE="$BASE_URL/api"
COOKIE_FILE="/tmp/ludo-cookies.txt"

echo "======================================"
echo "Ludo API Comprehensive Test Suite"
echo "======================================"
echo ""

# Test counter
PASSED=0
FAILED=0
TOTAL=0

test_result() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        PASSED=$((PASSED + 1))
        echo "✅ PASS: $2"
    else
        FAILED=$((FAILED + 1))
        echo "❌ FAIL: $2"
        if [ -n "$3" ]; then
            echo "   Error: $3"
        fi
    fi
}

# Clean up old cookies
rm -f $COOKIE_FILE

# 0. Login as Admin
echo "[0/8] Logging in as Admin..."
LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"password": "admin213"}')

LOGIN_OK=$(echo "$LOGIN_RESPONSE" | jq -r '.ok' 2>/dev/null)
if [ "$LOGIN_OK" = "true" ]; then
    test_result 0 "Admin login successful"
else
    test_result 1 "Admin login successful" "Got: $LOGIN_RESPONSE"
    echo "Cannot proceed without authentication"
    exit 1
fi
echo ""

# 1. Health Check
echo "[1/8] Testing Health Endpoint..."
HEALTH=$(curl -s -b $COOKIE_FILE "$API_BASE/health")
if echo "$HEALTH" | jq -e '.status == "ok"' >/dev/null 2>&1; then
    test_result 0 "Health endpoint responds"
else
    test_result 1 "Health endpoint responds" "Got: $HEALTH"
fi
echo ""

# 2. Get CSRF Token
echo "[2/8] Getting CSRF Token..."
CSRF_RESPONSE=$(curl -s -b $COOKIE_FILE "$API_BASE/admin/csrf")
CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | jq -r '.csrfToken' 2>/dev/null)
if [ -n "$CSRF_TOKEN" ] && [ "$CSRF_TOKEN" != "null" ]; then
    test_result 0 "CSRF token retrieved"
    echo "   Token: ${CSRF_TOKEN:0:20}..."
else
    test_result 1 "CSRF token retrieved" "Got: $CSRF_RESPONSE"
    exit 1
fi
echo ""

# 3. Create Album
echo "[3/8] Creating Test Album..."
CREATE_RESPONSE=$(curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X POST "$API_BASE/admin/albums" \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: $CSRF_TOKEN" \
    -d '{
        "title": "Test Album",
        "subtitle": "Automated Test",
        "quote": "Testing is important",
        "date": "2025-11-19"
    }')

ALBUM_ID=$(echo "$CREATE_RESPONSE" | jq -r '.album.id' 2>/dev/null)
NEW_CSRF=$(echo "$CREATE_RESPONSE" | jq -r '.csrfToken' 2>/dev/null)

if [ -n "$ALBUM_ID" ] && [ "$ALBUM_ID" != "null" ]; then
    test_result 0 "Album created"
    echo "   Album ID: $ALBUM_ID"
    if [ -n "$NEW_CSRF" ] && [ "$NEW_CSRF" != "null" ]; then
        CSRF_TOKEN="$NEW_CSRF"
        test_result 0 "CSRF token rotated after create"
        echo "   New Token: ${CSRF_TOKEN:0:20}..."
    else
        test_result 1 "CSRF token rotated after create" "No new token"
    fi
else
    test_result 1 "Album created" "Got: $CREATE_RESPONSE"
    exit 1
fi
echo ""

# 4. Update Album
echo "[4/8] Updating Album..."
UPDATE_RESPONSE=$(curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X PATCH "$API_BASE/admin/albums/$ALBUM_ID" \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: $CSRF_TOKEN" \
    -d '{
        "title": "Updated Test Album",
        "subtitle": "Modified",
        "quote": "Testing updates",
        "date": "2025-11-19"
    }')

UPDATED_TITLE=$(echo "$UPDATE_RESPONSE" | jq -r '.album.title' 2>/dev/null)
NEW_CSRF=$(echo "$UPDATE_RESPONSE" | jq -r '.csrfToken' 2>/dev/null)

if [ "$UPDATED_TITLE" = "Updated Test Album" ]; then
    test_result 0 "Album updated"
    if [ -n "$NEW_CSRF" ] && [ "$NEW_CSRF" != "null" ]; then
        CSRF_TOKEN="$NEW_CSRF"
        test_result 0 "CSRF token rotated after update"
    else
        test_result 1 "CSRF token rotated after update" "No new token"
    fi
else
    test_result 1 "Album updated" "Got: $UPDATE_RESPONSE"
fi
echo ""

# 5. Upload Photo (create a test image)
echo "[5/8] Uploading Photo..."
# Create a small test PNG (1x1 pixel red)
echo -n -e '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82' > /tmp/test-photo.png

UPLOAD_RESPONSE=$(curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X POST "$API_BASE/admin/albums/$ALBUM_ID/photos" \
    -H "x-csrf-token: $CSRF_TOKEN" \
    -F "photo=@/tmp/test-photo.png")

PHOTO_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.photos[0].id' 2>/dev/null)
NEW_CSRF=$(echo "$UPLOAD_RESPONSE" | jq -r '.csrfToken' 2>/dev/null)

if [ -n "$PHOTO_ID" ] && [ "$PHOTO_ID" != "null" ]; then
    test_result 0 "Photo uploaded"
    echo "   Photo ID: $PHOTO_ID"
    if [ -n "$NEW_CSRF" ] && [ "$NEW_CSRF" != "null" ]; then
        CSRF_TOKEN="$NEW_CSRF"
        test_result 0 "CSRF token rotated after upload"
    else
        test_result 1 "CSRF token rotated after upload" "No new token"
    fi
else
    test_result 1 "Photo uploaded" "Got: $UPLOAD_RESPONSE"
fi
echo ""

# 6. Delete Photo
echo "[6/8] Deleting Photo..."
if [ -n "$PHOTO_ID" ] && [ "$PHOTO_ID" != "null" ]; then
    DELETE_PHOTO_RESPONSE=$(curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X DELETE "$API_BASE/admin/albums/$ALBUM_ID/photos" \
        -H "Content-Type: application/json" \
        -H "x-csrf-token: $CSRF_TOKEN" \
        -d "{\"photoId\": \"$PHOTO_ID\"}")

    DELETE_OK=$(echo "$DELETE_PHOTO_RESPONSE" | jq -r '.ok' 2>/dev/null)
    NEW_CSRF=$(echo "$DELETE_PHOTO_RESPONSE" | jq -r '.csrfToken' 2>/dev/null)

    if [ "$DELETE_OK" = "true" ]; then
        test_result 0 "Photo deleted"
        if [ -n "$NEW_CSRF" ] && [ "$NEW_CSRF" != "null" ]; then
            CSRF_TOKEN="$NEW_CSRF"
            test_result 0 "CSRF token rotated after delete photo"
        else
            test_result 1 "CSRF token rotated after delete photo" "No new token"
        fi
    else
        test_result 1 "Photo deleted" "Got: $DELETE_PHOTO_RESPONSE"
    fi
else
    test_result 1 "Photo deleted" "No photo ID to delete"
fi
echo ""

# 7. Delete Album
echo "[7/8] Deleting Album..."
DELETE_ALBUM_RESPONSE=$(curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X DELETE "$API_BASE/admin/albums/$ALBUM_ID" \
    -H "x-csrf-token: $CSRF_TOKEN")

DELETE_OK=$(echo "$DELETE_ALBUM_RESPONSE" | jq -r '.ok' 2>/dev/null)
NEW_CSRF=$(echo "$DELETE_ALBUM_RESPONSE" | jq -r '.csrfToken' 2>/dev/null)

if [ "$DELETE_OK" = "true" ]; then
    test_result 0 "Album deleted"
    if [ -n "$NEW_CSRF" ] && [ "$NEW_CSRF" != "null" ]; then
        test_result 0 "CSRF token rotated after delete album"
    else
        test_result 1 "CSRF token rotated after delete album" "No new token"
    fi
else
    test_result 1 "Album deleted" "Got: $DELETE_ALBUM_RESPONSE"
fi
echo ""

# 8. Verify Album is Gone
echo "[8/8] Verifying Album Deletion..."
# Wait a moment for eventual consistency
sleep 2
ALBUMS_RESPONSE=$(curl -s -b $COOKIE_FILE "$API_BASE/admin/albums")
ALBUM_STILL_EXISTS=$(echo "$ALBUMS_RESPONSE" | jq ".albums[] | select(.id == \"$ALBUM_ID\")" 2>/dev/null)

if [ -z "$ALBUM_STILL_EXISTS" ]; then
    test_result 0 "Album no longer exists in list"
else
    test_result 1 "Album no longer exists in list" "Album still found"
fi
echo ""

# Cleanup
rm -f /tmp/test-photo.png
rm -f $COOKIE_FILE

# Final Report
echo "======================================"
echo "Test Results:"
echo "======================================"
echo "Total Tests: $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""
if [ $FAILED -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Success rate: 100%"
    exit 0
else
    SUCCESS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)
    echo "⚠️  TESTS FAILED. Success rate: $SUCCESS_RATE%"
    exit 1
fi
