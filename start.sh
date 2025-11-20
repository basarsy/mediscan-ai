#!/bin/bash
# Startup script for MediScan AI - Starts both backend and frontend servers

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   MediScan AI - Startup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if model file exists
if [ ! -f "skin_cancer_model.h5" ]; then
    echo -e "${YELLOW}Warning: skin_cancer_model.h5 not found in project root!${NC}"
    echo -e "${YELLOW}The backend will not work without the model file.${NC}"
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend Server
echo -e "${GREEN}[1/2] Starting Backend Server...${NC}"

if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
fi

cd backend
source venv/bin/activate
echo -e "${YELLOW}Starting backend server...${NC}"
python server.py &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
MAX_WAIT=30
WAIT_COUNT=0
BACKEND_READY=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
    
    # Check if process is still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}✗ Backend server process died${NC}"
        exit 1
    fi
    
    # Check if backend is responding
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        BACKEND_READY=1
        break
    fi
    
    # Show progress
    if [ $((WAIT_COUNT % 3)) -eq 0 ]; then
        echo -e "${YELLOW}  Still waiting... (${WAIT_COUNT}s)${NC}"
    fi
done

# Check if backend is ready
if [ $BACKEND_READY -eq 1 ]; then
    echo -e "${GREEN}✓ Backend server is ready! (PID: $BACKEND_PID)${NC}"
    echo -e "${BLUE}  Backend running on: http://localhost:5000${NC}"
    echo -e "${YELLOW}  Backend debug output will appear below:${NC}"
    echo ""
else
    echo -e "${RED}✗ Backend server failed to start within ${MAX_WAIT} seconds${NC}"
    echo -e "${RED}  Check if port 5000 is already in use or check for errors${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""

# Start Frontend Server
echo -e "${GREEN}[2/2] Starting Frontend Server...${NC}"

npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend server started (PID: $FRONTEND_PID)${NC}"
    echo -e "${BLUE}  Frontend running on: http://localhost:8080${NC}"
    echo -e "${YELLOW}  (Frontend output is logged to frontend.log)${NC}"
else
    echo -e "${RED}✗ Frontend server failed to start${NC}"
    echo -e "${RED}  Check frontend.log for errors${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Both servers are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Frontend:${NC} http://localhost:8080"
echo -e "${BLUE}Backend:${NC}  http://localhost:5000"
echo ""
echo -e "${YELLOW}Backend debug output will appear below as you use the app${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""
echo -e "${BLUE}----------------------------------------${NC}"
echo ""

# Wait for backend process and show its output
# This keeps the backend output visible in the terminal
wait $BACKEND_PID

