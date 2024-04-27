#!/bin/bash

# Get the absolute path of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Change to the script directory
cd "${SCRIPT_DIR}" || exit 1

# Check if the source file exists before attempting to move it
if [ -f schema.prisma.mysql ]; then
  # Rename the source file to schema.prisma
  mv schema.prisma.mysql schema.prisma
else
  echo "Source file schema.prisma.mysql not found!"
fi

