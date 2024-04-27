#!/bin/bash

# Change to the parent directory of the script
cd "$(dirname "$0")"/.. || exit 1

# Change to the platform directory
cd platform || exit 1

# Remove the poetry.lock file if it exists
if [ -f poetry.lock ]; then
  rm poetry.lock
fi

# Install the dependencies using Poetry
poetry install

# Lock the dependencies using Poetry
poetry lock
