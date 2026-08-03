#!/bin/sh
set -e

# Use a marker file to track if initial seeding has been done.
if [ -d /app/uploads.default ] && [ ! -f /app/uploads/.seeded ]; then
  echo "First run — copying default uploads into volume..."
  cp -rn /app/uploads.default/* /app/uploads/ 2>/dev/null || true
  touch /app/uploads/.seeded
  echo "Done."
fi

# Apply pending database migrations before accepting traffic.
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Migrations applied."

exec node dist/server.js
