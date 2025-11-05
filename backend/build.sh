#!/bin/bash

# Build script for Render

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Running database migrations..."
alembic upgrade head

echo "Build completed successfully!"
