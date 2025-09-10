#!/bin/bash

echo "=== SECURE-MY-DOCS Deployment Script ==="

# Build the frontend
echo "Building frontend..."
cd frontend
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Frontend build successful!"
else
    echo "Frontend build failed! Exiting."
    exit 1
fi

cd ..

# Copy the built frontend to backend resources
echo "Copying frontend build to backend..."
rm -rf backend/securemydocs/src/main/resources/static
mkdir -p backend/securemydocs/src/main/resources/static
cp -r frontend/dist/* backend/securemydocs/src/main/resources/static/

echo "Frontend built and copied to backend resources!"
echo "Deployment preparation complete!"