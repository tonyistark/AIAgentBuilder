#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null
}

# ASCII Art Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           🚀 LangFlow Clone Setup & Launch 🚀             ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check for required tools
print_status "Checking system requirements..."

# Check Node.js
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ required. Current version: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) detected"
fi

# Check Python
if ! command_exists python3; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    echo "Visit: https://www.python.org/"
    exit 1
else
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    print_success "Python $PYTHON_VERSION detected"
fi

# Check npm
if ! command_exists npm; then
    print_error "npm is not installed. Please install npm."
    exit 1
else
    print_success "npm $(npm -v) detected"
fi

# Check Poetry
if ! command_exists poetry; then
    print_warning "Poetry is not installed. Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
    
    # Check again
    if ! command_exists poetry; then
        print_error "Failed to install Poetry. Please install manually."
        echo "Visit: https://python-poetry.org/docs/#installation"
        exit 1
    fi
    print_success "Poetry installed successfully"
else
    print_success "Poetry $(poetry --version) detected"
fi

# Check if ports are available
print_status "Checking port availability..."
if port_in_use 3000; then
    print_warning "Port 3000 is already in use. Frontend will use next available port."
fi
if port_in_use 8000; then
    print_warning "Port 8000 is already in use. Backend will use next available port."
fi

# Setup Backend
echo ""
print_status "Setting up Backend..."
cd backend

# Install Python dependencies
print_status "Installing Python dependencies with Poetry..."
poetry install

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating backend .env file..."
    cat > .env << EOL
# Database
DATABASE_URL=sqlite:///./langflow.db

# Security
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001","http://127.0.0.1:3000","http://127.0.0.1:3001"]

# API Keys (Add your own)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
HUGGINGFACE_API_TOKEN=

# Development
DEBUG=True
EOL
    print_success "Backend .env file created"
    print_warning "Remember to add your API keys to backend/.env"
else
    print_success "Backend .env file already exists"
fi

# Initialize database
print_status "Initializing database..."
poetry run python -c "
from app.db.base import Base
from app.db.session import engine
Base.metadata.create_all(bind=engine)
print('Database initialized successfully')
" 2>/dev/null || print_warning "Database already initialized or will be created on first run"

cd ..

# Setup Frontend
echo ""
print_status "Setting up Frontend..."
cd frontend

# Install Node dependencies
print_status "Installing Node dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating frontend .env file..."
    cat > .env << EOL
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
EOL
    print_success "Frontend .env file created"
else
    print_success "Frontend .env file already exists"
fi

cd ..

# Create run script
print_status "Creating run script..."
cat > run.sh << 'EOL'
#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting LangFlow Clone...${NC}"

# Function to kill processes on exit
cleanup() {
    echo -e "\n${RED}Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start Backend
echo -e "${BLUE}Starting Backend on http://localhost:8000${NC}"
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start Frontend
echo -e "${BLUE}Starting Frontend on http://localhost:3000${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a bit for frontend to start
sleep 3

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        🎉 LangFlow Clone is now running! 🎉              ║"
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
EOL

chmod +x run.sh
print_success "Run script created"

# Final success message
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        ✅ Setup completed successfully! ✅                ║"
echo "║                                                           ║"
echo "║   To start the application, run:                          ║"
echo "║   ./run.sh                                                ║"
echo "║                                                           ║"
echo "║   Or start services individually:                         ║"
echo "║   Backend:  cd backend && poetry run uvicorn app.main:app ║"
echo "║   Frontend: cd frontend && npm run dev                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Ask if user wants to start now
echo ""
read -p "Would you like to start the application now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./run.sh
fi
