#!/usr/bin/env bash

# Check if the required arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <host> <port>"
    exit 1
fi

host="$1"
port="$2"

# Use a loop with timeout to check if the database is available
while true; do
    if nc -z -w3 "$host" "$port"; then
        echo "Database is available! Continuing..."
        break
    else
        echo "Database is unavailable - Sleeping..."
        sleep 5
    fi
done

