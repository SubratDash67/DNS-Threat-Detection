#!/bin/bash

# Build script for Render

# Verify Python version
echo "Python version check..."
python --version
if [[ $(python --version 2>&1) == *"3.13"* ]]; then
    echo "ERROR: Python 3.13 detected. Render must use Python 3.11.9 (from runtime.txt)"
    exit 1
fi

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Running database migrations..."
alembic upgrade head

echo "Build completed successfully!"
