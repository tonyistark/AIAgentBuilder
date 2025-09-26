#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting AI Agent Builder (Simple Mode)...${NC}"

# Function to kill processes on exit
cleanup() {
    echo -e "\n${RED}Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start Backend with basic Python
echo -e "${BLUE}Starting Backend on http://localhost:8000${NC}"
cd backend

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
source venv/bin/activate
pip3 install -r requirements.txt 2>/dev/null || echo -e "${YELLOW}Some dependencies might be missing, but trying to start anyway...${NC}"

# Start the backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start Frontend
echo -e "${BLUE}Starting Frontend on http://localhost:3000${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a bit for frontend to start
sleep 3

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        🎉 AI Agent Builder is now running! 🎉            ║"
echo "║                                                           ║"
echo "║   Frontend: http://localhost:3000                         ║"
echo "║   Backend:  http://localhost:8000                         ║"
echo "║   API Docs: http://localhost:8000/docs                    ║"
echo "║                                                           ║"
echo "║   Press Ctrl+C to stop all services                       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Keep script running
wait
