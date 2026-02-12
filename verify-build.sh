#!/bin/bash
# Hostinger Deployment Verification Script
# Run this script after build to verify all required files are present

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Hostinger Deployment Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if dist/ exists
if [ ! -d "dist" ]; then
    echo "❌ ERROR: dist/ directory not found"
    echo "   Run 'npm run build' first"
    exit 1
fi

echo "📁 Checking build output in dist/..."
echo ""

# Critical files that must exist
REQUIRED_FILES=(
    "index.html"
    ".htaccess"
    "favicon.ico"
    "manifest.json"
    "robots.txt"
    "sitemap.xml"
    "404.html"
    "health.json"
)

ERRORS=0
WARNINGS=0

# Check each required file
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "dist/$file" ]; then
        SIZE=$(du -h "dist/$file" | cut -f1)
        echo "✅ $file ($SIZE)"
    else
        echo "❌ MISSING: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "📦 Checking assets directory..."

# Check assets directory
if [ -d "dist/assets" ]; then
    ASSET_COUNT=$(find dist/assets -type f | wc -l)
    ASSET_SIZE=$(du -sh dist/assets | cut -f1)
    echo "✅ assets/ directory found ($ASSET_COUNT files, $ASSET_SIZE total)"
    
    # Check for CSS files
    CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
    if [ $CSS_COUNT -gt 0 ]; then
        echo "   ✅ CSS files: $CSS_COUNT"
    else
        echo "   ⚠️  WARNING: No CSS files found"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for JS files
    JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
    if [ $JS_COUNT -gt 0 ]; then
        echo "   ✅ JS files: $JS_COUNT"
    else
        echo "   ❌ ERROR: No JS files found"
        ERRORS=$((ERRORS + 1))
    fi
    
else
    echo "❌ ERROR: assets/ directory not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🔧 Checking .htaccess configuration..."

# Check .htaccess content
if [ -f "dist/.htaccess" ]; then
    if grep -q "RewriteEngine On" dist/.htaccess; then
        echo "✅ RewriteEngine directive found"
    else
        echo "⚠️  WARNING: RewriteEngine directive not found"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "RewriteRule . /index.html" dist/.htaccess; then
        echo "✅ SPA routing configured"
    else
        echo "⚠️  WARNING: SPA routing might not be configured"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "mod_deflate" dist/.htaccess; then
        echo "✅ Gzip compression configured"
    else
        echo "⚠️  WARNING: Gzip compression not configured"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "📊 Build statistics..."
TOTAL_SIZE=$(du -sh dist | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l)
echo "   Total size: $TOTAL_SIZE"
echo "   Total files: $FILE_COUNT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -gt 0 ]; then
    echo "❌ VERIFICATION FAILED"
    echo "   Errors: $ERRORS"
    echo "   Warnings: $WARNINGS"
    echo ""
    echo "⚠️  DO NOT DEPLOY - Fix errors first!"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  VERIFICATION PASSED WITH WARNINGS"
    echo "   Errors: $ERRORS"
    echo "   Warnings: $WARNINGS"
    echo ""
    echo "✅ Safe to deploy, but check warnings"
    exit 0
else
    echo "✅ VERIFICATION PASSED"
    echo "   All required files present"
    echo "   Configuration looks good"
    echo ""
    echo "🚀 Ready for deployment to Hostinger!"
    exit 0
fi
