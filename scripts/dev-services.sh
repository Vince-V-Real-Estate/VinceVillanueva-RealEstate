#!/usr/bin/env bash
# Starts development services (PostgreSQL) via Docker Compose

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

# Check if docker/podman is available
if ! command -v docker &> /dev/null && ! command -v podman &> /dev/null; then
  echo "Error: Docker or Podman is required but not installed."
  exit 1
fi

# Determine which command to use
if command -v docker &> /dev/null; then
  COMPOSE_CMD="docker compose"
elif command -v podman &> /dev/null; then
  COMPOSE_CMD="podman-compose"
fi

# Check if daemon is running
if ! docker info &> /dev/null 2>&1; then
  echo "Error: Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

echo "Starting development services..."
$COMPOSE_CMD up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 2

echo "Development services are running."
echo "PostgreSQL is available at localhost:${DB_PORT:-5432}"
