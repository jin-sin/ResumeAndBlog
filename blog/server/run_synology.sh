#!/bin/bash
# Script to run the Flask API server on Synology NAS

# Export environment variables for the database
export DB_HOST="localhost"
export DB_USER="blog_user"
export DB_PASSWORD="jIrzur-9xoski-puxtag"  # Your password is kept here
export DB_NAME="blog_db"
export BASE_URL="https://orange-man.xyz"

# Install required packages if needed
echo "Installing required packages..."
pip install -r requirements.txt

# CORS debugging information
echo "================================================"
echo "CORS DEBUGGING INFORMATION"
echo "================================================"
echo "Current directory: $(pwd)"
echo "Python version: $(python3 --version)"
echo "IP addresses: $(hostname -I || echo 'hostname -I not available')"
echo "Checking if port 5501 is already in use:"
netstat -tuln | grep 5501 || echo "Port 5501 is available"
echo "================================================"

# Run the Flask server with CORS enabled
echo "Starting Flask server on port 5501..."
echo "Access the CORS debug tool at: http://YOUR-SERVER-IP:5501/cors-debug.html"
echo "Press Ctrl+C to stop the server"
echo "================================================"

# Run with increased verbosity for debugging
python3 -u app.py
