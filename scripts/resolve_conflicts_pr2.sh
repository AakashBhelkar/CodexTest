#!/usr/bin/env bash
set -euo pipefail

# Conflict files reported in PR #2
CONFLICT_FILES=(
  "README.md"
  "package.json"
  "src/app.ts"
  "src/config/env.ts"
  "src/controllers/return-request.controller.ts"
  "src/db/postgres.ts"
  "src/routes/auth.routes.ts"
  "src/server.ts"
  "src/services/return-request.service.ts"
  "src/services/user.store.ts"
)

echo "Resolving known PR #2 conflicts by keeping current branch versions (--ours)..."
for file in "${CONFLICT_FILES[@]}"; do
  git checkout --ours -- "$file" || true
done

git add "${CONFLICT_FILES[@]}"

echo "Done. Remaining conflicts (if any):"
git status --short

echo
echo "Next steps:"
echo "1) Verify files: git diff --cached"
echo "2) Run checks/tests"
echo "3) Continue merge: git commit"
