#!/usr/bin/env bash
# Development startup script
# Checks DATABASE_URL and starts local services if needed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Load environment variables
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

# Function to check if DATABASE_URL points to production
is_production_db() {
  local url="$DATABASE_URL"
  
  # Check for common production database patterns
  if [[ "$url" == *"neon.tech"* ]] || \
     [[ "$url" == *"supabase.co"* ]] || \
     [[ "$url" == *"railway.app"* ]] || \
     [[ "$url" == *"render.com"* ]] || \
     [[ "$url" == *"planetscale.com"* ]] || \
     [[ "$url" == *"amazonaws.com"* ]] || \
     [[ "$url" == *"azure.com"* ]] || \
     [[ "$url" == *"digitalocean.com"* ]]; then
    return 0  # true - is production
  fi
  
  # Check for localhost patterns (development)
  if [[ "$url" == *"localhost"* ]] || \
     [[ "$url" == *"127.0.0.1"* ]] || \
     [[ "$url" == *"0.0.0.0"* ]]; then
    return 1  # false - is development
  fi
  
  # Default to assuming it's production (safer)
  return 0
}

echo "Checking database configuration..."

if [[ -z "$DATABASE_URL" ]]; then
  echo "Error: DATABASE_URL is not set in .env"
  exit 1
fi

if is_production_db; then
  echo "Production database detected. Skipping local Docker services."
  echo "DATABASE_URL points to a remote database."
else
  echo "Local database detected. Starting Docker services..."
  "$SCRIPT_DIR/dev-services.sh"
fi

echo ""
echo "Starting Next.js development server..."
exec bun run next dev --turbo
