#!/bin/bash
# ─── build.sh — Build React frontend and copy to backend/dist ───
# Used for single-service deployment (Railway)

set -e

echo "=== Building EnergyBae Frontend ==="

# Install frontend dependencies and build
cd frontend
npm install
npm run build
cd ..

# Copy the built files to backend/dist
echo "=== Copying build to backend/dist ==="
rm -rf backend/dist
cp -r frontend/dist backend/dist

echo "=== Build complete! ==="
echo "Frontend build copied to backend/dist"
ls -la backend/dist/
