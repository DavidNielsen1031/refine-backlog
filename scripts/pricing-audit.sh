#!/bin/bash
# pricing-audit.sh — Verify pricing consistency across all surfaces
# Compares rate-limit code constants against marketing copy.
#
# Usage: ./scripts/pricing-audit.sh <app-dir>

set -euo pipefail

APP_DIR="${1:-.}"
FAIL=0
WARN=0

echo "💰 Pricing audit: $APP_DIR"
echo "---"

# Extract tier info from rate-limit code
echo "Extracting from code..."
if [ -f "$APP_DIR/src/lib/rate-limit.ts" ]; then
  echo "  Found rate-limit.ts"
  # Show the tier definitions for manual review
  grep -A3 'free:\|lite:\|pro:\|solo:\|team:' "$APP_DIR/src/lib/rate-limit.ts" 2>/dev/null | head -30 || true
else
  echo "⚠️  rate-limit.ts not found"
  WARN=1
fi

echo ""
echo "Checking for pricing mentions across surfaces..."

# Files to check for pricing
SURFACES=(
  "README.md"
  "mcp/README.md"
  "public/llms.txt"
)

for surface in "${SURFACES[@]}"; do
  if [ -f "$APP_DIR/$surface" ]; then
    PRICING_LINES=$(grep -in 'free\|lite\|\$9\|\$29\|\$79\|per.month\|/mo\|lints/day\|requests/day\|items.*request' "$APP_DIR/$surface" 2>/dev/null || true)
    if [ -n "$PRICING_LINES" ]; then
      echo ""
      echo "📄 $surface:"
      echo "$PRICING_LINES"
    fi
  fi
done

# Check pricing components
echo ""
echo "Checking UI components..."
PRICING_COMPONENTS=$(find "$APP_DIR/src" -name "*pricing*" -o -name "*tier*" -o -name "*plan*" 2>/dev/null | grep -v node_modules | grep -v '.test.' || true)
for comp in $PRICING_COMPONENTS; do
  PRICING_LINES=$(grep -n 'free\|lite\|\$9\|\$29\|\$79\|per.month\|/mo\|lints/day\|requests/day' "$comp" 2>/dev/null || true)
  if [ -n "$PRICING_LINES" ]; then
    echo ""
    echo "📄 $comp:"
    echo "$PRICING_LINES" | head -15
  fi
done

# Check for known inconsistency patterns
echo ""
echo "---"
echo "Checking for known inconsistency patterns..."

# "5 lints/day" vs "3 requests/day"
LINTS_DAY=$(grep -rn '5 lints/day\|5 lints per day' "$APP_DIR/src/" 2>/dev/null | grep -v node_modules || true)
REQS_DAY=$(grep -rn '3 requests/day\|3 requests per day' "$APP_DIR/src/" 2>/dev/null | grep -v node_modules || true)
if [ -n "$LINTS_DAY" ] && [ -n "$REQS_DAY" ]; then
  echo "❌ INCONSISTENCY: Both '5 lints/day' AND '3 requests/day' found:"
  echo "  $LINTS_DAY"
  echo "  $REQS_DAY"
  FAIL=1
fi

# "coming soon" on shipped features
COMING_SOON=$(grep -rn 'coming soon' "$APP_DIR/src/" 2>/dev/null | grep -v node_modules | grep -vi 'annual\|yearly' || true)
if [ -n "$COMING_SOON" ]; then
  echo "⚠️  'Coming soon' found — verify these features aren't already shipped:"
  echo "$COMING_SOON"
  WARN=1
fi

echo ""
echo "---"
if [ "$FAIL" -gt 0 ]; then
  echo "❌ Pricing audit FAILED — inconsistencies found"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "⚠️  Pricing audit passed with warnings — review above"
else
  echo "✅ Pricing audit passed"
fi
