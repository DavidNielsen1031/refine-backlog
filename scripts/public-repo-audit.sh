#!/bin/bash
# public-repo-audit.sh — Verify repo is ready for public/open-source visibility
# Run before first deploy or after open-sourcing.
#
# Usage: ./scripts/public-repo-audit.sh <repo> [app-dir]
# Example: ./scripts/public-repo-audit.sh DavidNielsen1031/speclint products/refine-backlog/app

set -euo pipefail

REPO="${1:-}"
APP_DIR="${2:-.}"
FAIL=0

if [ -z "$REPO" ]; then
  echo "Usage: $0 <owner/repo> [app-dir]"
  exit 1
fi

echo "🔍 Public repo audit: $REPO"
echo "   App dir: $APP_DIR"
echo "---"

# 1. Repo visibility
echo "Checking repo visibility..."
IS_PRIVATE=$(gh repo view "$REPO" --json isPrivate --jq '.isPrivate' 2>/dev/null || echo "unknown")
if [ "$IS_PRIVATE" = "true" ]; then
  echo "❌ Repo is PRIVATE — must be Public for open-source"
  FAIL=1
elif [ "$IS_PRIVATE" = "unknown" ]; then
  echo "⚠️  Could not determine visibility (gh auth issue?)"
else
  echo "✅ Repo is public"
fi

# 2. LICENSE file
echo ""
echo "Checking LICENSE..."
if [ -f "$APP_DIR/LICENSE" ] || [ -f "$APP_DIR/LICENSE.md" ]; then
  echo "✅ LICENSE file present"
else
  echo "❌ No LICENSE file found"
  FAIL=1
fi

# 3. No .env files tracked
echo ""
echo "Checking for tracked .env files..."
ENV_FILES=$(cd "$APP_DIR" && git ls-files '.env*' 2>/dev/null || true)
if [ -n "$ENV_FILES" ]; then
  echo "❌ .env files tracked in git:"
  echo "$ENV_FILES"
  FAIL=1
else
  echo "✅ No .env files in git"
fi

# 4. No internal docs
echo ""
echo "Checking for internal docs that shouldn't be public..."
INTERNAL_PATTERNS=(
  "ENTITLEMENT_ARCHITECTURE.md"
  "INTERNAL_*.md"
  "research/"
  ".axon/"
)
for pattern in "${INTERNAL_PATTERNS[@]}"; do
  FOUND=$(cd "$APP_DIR" && git ls-files "$pattern" 2>/dev/null || true)
  if [ -n "$FOUND" ]; then
    echo "❌ Internal file tracked: $FOUND"
    FAIL=1
  fi
done
[ "$FAIL" -eq 0 ] && echo "✅ No internal docs exposed"

# 5. No hardcoded API keys or secret prefixes
echo ""
echo "Checking for hardcoded secrets..."
SECRETS=$(cd "$APP_DIR" && grep -rn 'SK-INTERNAL\|sk_live_\|sk_test_\|whsec_' src/ 2>/dev/null | grep -v 'node_modules' | grep -v '.test.' | grep -v 'process\.env' || true)
if [ -n "$SECRETS" ]; then
  echo "❌ Hardcoded secrets found:"
  echo "$SECRETS"
  FAIL=1
else
  echo "✅ No hardcoded secrets"
fi

# 6. README exists and has content
echo ""
echo "Checking README..."
if [ -f "$APP_DIR/README.md" ]; then
  LINES=$(wc -l < "$APP_DIR/README.md")
  if [ "$LINES" -lt 10 ]; then
    echo "⚠️  README.md exists but is thin ($LINES lines)"
  else
    echo "✅ README.md present ($LINES lines)"
  fi
else
  echo "❌ No README.md"
  FAIL=1
fi

# 7. Security vulnerabilities
echo ""
echo "Checking npm audit..."
AUDIT_RESULT=$(cd "$APP_DIR" && npm audit --audit-level=moderate 2>&1 || true)
if echo "$AUDIT_RESULT" | grep -q "found 0 vulnerabilities"; then
  echo "✅ No security vulnerabilities"
else
  VULN_COUNT=$(echo "$AUDIT_RESULT" | grep -oP '\d+ vulnerabilities' || echo "unknown")
  echo "⚠️  Security issues: $VULN_COUNT"
fi

# 8. Large files
echo ""
echo "Checking for large tracked files (>5MB)..."
LARGE_FILES=$(cd "$APP_DIR" && git ls-files --cached | while IFS= read -r f; do
  if [ -f "$f" ]; then
    size=$(wc -c < "$f")
    if [ "$size" -gt 5242880 ]; then
      echo "  $f ($(( size / 1048576 ))MB)"
    fi
  fi
done)
if [ -n "$LARGE_FILES" ]; then
  echo "⚠️  Large files in repo:"
  echo "$LARGE_FILES"
else
  echo "✅ No large files"
fi

echo ""
echo "---"
if [ "$FAIL" -eq 0 ]; then
  echo "✅ Public repo audit PASSED"
else
  echo "❌ Public repo audit FAILED — fix issues before launch"
  exit 1
fi
