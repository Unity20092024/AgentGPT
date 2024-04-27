#!/usr/bin/env bash

# Change to the script's directory
cd "$(dirname "$(readlink -f "$0")")" || exit 1

# Check if the current directory is a Git repository
if [ ! -d .git ]; then
  echo "Error: This script must be run from a Git repository."
  exit 1
fi

# Change to the CLI directory and install dependencies
cd cli || exit 1
if ! npm install; then
  echo "Error: Failed to install npm dependencies."
  exit 1
fi

# Run the start script
if ! npm run start; then
  echo "Error: Failed to start the CLI."
  exit 1
fi
