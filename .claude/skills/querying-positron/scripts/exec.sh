#!/bin/bash

# Check if mongosh is installed
if ! command -v mongosh &> /dev/null; then
    echo "Error: mongosh is not installed." >&2
    echo "Please install MongoDB Shell. See scripts/setup.sh" >&2
    exit 1
fi

# Source .env.shared if it exists (from repo root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
if [[ -f "$REPO_ROOT/.env.shared" ]]; then
    source "$REPO_ROOT/.env.shared"
fi

# Check if connection string env var is set
if [[ -z "$POSITRON_PRODUCTION_READONLY_MONGO_URL" ]]; then
    echo "Error: POSITRON_PRODUCTION_READONLY_MONGO_URL environment variable is not set." >&2
    echo "Please ensure you have the latest .env.shared. See scripts/setup.sh" >&2
    exit 1
fi

# Check if a query was provided
if [[ -z "$1" ]]; then
    echo "Error: No query provided." >&2
    echo "Usage: exec.sh '<mongodb-query>'" >&2
    exit 1
fi

# Execute the mongosh command and capture output
OUTPUT=$(mongosh "$POSITRON_PRODUCTION_READONLY_MONGO_URL" --quiet --eval "$1" 2>&1)
EXIT_CODE=$?

# Check for connection timeout (VPN not connected)
if [[ "$OUTPUT" == *"MongoServerSelectionError"* ]]; then
    echo "Error: Cannot connect to MongoDB." >&2
    echo "Please ensure you are connected to the production VPN." >&2
    exit 1
fi

# Output the result
echo "$OUTPUT"
exit $EXIT_CODE
