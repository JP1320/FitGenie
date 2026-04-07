#!/usr/bin/env bash
set -euo pipefail

TAG_NAME="phase1-docs-baseline"
TAG_MSG="Phase 1 documentation and prompt baseline freeze"

git fetch --all --tags
git tag -a "$TAG_NAME" -m "$TAG_MSG" || true
git push origin "$TAG_NAME"
echo "✅ Tag pushed: $TAG_NAME"
