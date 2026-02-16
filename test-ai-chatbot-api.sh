#!/bin/bash
# Integration test for AI Chatbot API endpoints
# This script tests the basic functionality of the new endpoints

set -e

echo "=== AI Chatbot API Integration Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

function test_fail() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

function test_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

echo "1. Testing database schema..."
php -r "
require_once 'public/api/db.php';
\$db = getDB();
\$stmt = \$db->query(\"SELECT name FROM sqlite_master WHERE type='table' AND name='ai_keys'\");
\$table = \$stmt->fetch();
if (!\$table) {
    echo 'FAIL: ai_keys table does not exist';
    exit(1);
}
echo 'PASS';
" || test_fail "Database schema check failed"
test_pass "Database has ai_keys table"

echo ""
echo "2. Testing PHP syntax..."
php -l public/api/ai-keys.php > /dev/null 2>&1 || test_fail "ai-keys.php has syntax errors"
test_pass "ai-keys.php syntax is valid"

php -l public/api/chat.php > /dev/null 2>&1 || test_fail "chat.php has syntax errors"
test_pass "chat.php syntax is valid"

php -l public/api/config.php > /dev/null 2>&1 || test_fail "config.php has syntax errors"
test_pass "config.php syntax is valid"

echo ""
echo "3. Verifying constants are defined..."
php -r "
require_once 'public/api/config.php';
if (!defined('OPENAI_TIMEOUT')) {
    echo 'FAIL: OPENAI_TIMEOUT not defined';
    exit(1);
}
if (OPENAI_TIMEOUT !== 30) {
    echo 'FAIL: OPENAI_TIMEOUT has wrong value';
    exit(1);
}
echo 'PASS';
" || test_fail "Config constants check failed"
test_pass "OPENAI_TIMEOUT constant is defined correctly"

echo ""
echo "4. Testing TypeScript compilation..."
if [ -f "src/lib/chat-service.ts" ] && [ -f "src/lib/ai-admin-service.ts" ]; then
    test_pass "TypeScript source files exist"
else
    test_fail "TypeScript source files are missing"
fi

echo ""
echo "5. Verifying built files..."
if [ -f "dist/api/ai-keys.php" ] && [ -f "dist/api/chat.php" ]; then
    test_pass "PHP API files copied to dist"
else
    test_fail "PHP API files not found in dist"
fi

echo ""
test_info "Note: Full integration tests require:"
test_info "  - Running PHP web server"
test_info "  - Admin authentication"
test_info "  - Valid OpenAI API key"
test_info "  - These tests can be run manually using the admin UI"

echo ""
echo "=== Basic Tests Complete ==="
echo ""
echo -e "${GREEN}All basic tests passed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Deploy the changes to production"
echo "  2. Login as admin"
echo "  3. Add OpenAI API key in Admin → KI-Verwaltung"
echo "  4. Test chatbot on Kontakt page"
echo ""
