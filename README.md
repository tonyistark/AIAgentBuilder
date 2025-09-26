# 🚀 AI Agent Builder

A powerful visual AI workflow builder for creating multi-agent systems. Build, test, and deploy AI workflows through an intuitive drag-and-drop interface with dynamic agent orchestration capabilities.

## ✨ Features

- 🎨 **Visual Flow Builder**: Drag-and-drop interface for building AI workflows
- 🤖 **Multi-Model Support**: Llama, Anthropic, Cohere, HuggingFace, and more
- 🔌 **Dynamic Connections**: Add up to 10 inputs and agent outputs per node
- 🤝 **Multi-Agent Orchestration**: Connect multiple specialized agents to language models
- 🔄 **Real-time Execution**: Stream results as workflows execute
- 💾 **Persistence**: Save and load workflows with version control
- 🎯 **Smart Components**: 9 categories with 30+ pre-built components
- 🚀 **One-Command Setup**: Get started in seconds with automated setup

## Tech Stack

### Backend
- Python 3.10+ with FastAPI
- SQLAlchemy for database ORM
- Celery for async task processing
- WebSocket support for real-time updates

### Frontend
- React 18+ with TypeScript
- React Flow for visual workflow building
- Tailwind CSS for styling
- Zustand for state management
- React Query for data fetching

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

### Simple Setup & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd AIAgentBuilder

# Frontend Setup
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8003" > .env
echo "VITE_WS_URL=ws://localhost:8003" >> .env

# Start Frontend (in one terminal)
npm run dev
# Frontend will be available at http://localhost:3000

# Backend Setup (in another terminal)
cd ../backend
pip3 install fastapi uvicorn python-multipart

# Start Backend
python3 simple_server.py
# Backend will be available at http://localhost:8003
```

### One-Command Start (if already set up)
```bash
# Use the simple start script
./start_simple.sh
```

## 🛠️ Alternative Setup Methods

### Using Make
```bash
# See all available commands
make help

# Run both services
make dev
```

### Using Poetry (Advanced)
```bash
# If you have Poetry installed
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

## 🔧 Troubleshooting

### Port Conflicts
If ports 3000 or 8003 are in use:
- Frontend: Will automatically use port 3001
- Backend: Edit `simple_server.py` and change the port number

### Python Issues
If you get module errors:
- Use the `simple_server.py` instead of the full backend
- Only requires: `pip3 install fastapi uvicorn python-multipart`

### Node.js Version
- Requires Node.js 16+ (works with warnings on Node.js 22)
- The warnings about Node.js version can be safely ignored

## 🎯 What's Working

### Current Features
- ✅ Visual flow builder with drag-and-drop
- ✅ Dark theme professional UI
- ✅ Llama model node with dynamic I/O
- ✅ Add up to 10 inputs and 10 agent outputs per node
- ✅ Component sidebar with 9 categories
- ✅ Basic API endpoints
- ✅ CORS configured for local development

### Quick Test
1. Open http://localhost:3000 in your browser
2. Drag the "Llama" component from the Models section
3. Click the "+" button to add more inputs or agent outputs
4. Connect nodes by dragging between connection points

## Project Structure

```
AIAgentBuilder/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── components/   # Flow components
│   │   ├── core/         # Core configuration
│   │   ├── db/           # Database models
│   │   ├── flows/        # Flow execution engine
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   └── types/        # TypeScript types
│   └── package.json
└── docker/
    └── docker-compose.yml
```

## Usage

1. **Create an Account**: Register a new account or login with existing credentials

2. **Build a Flow**:
   - Drag components from the sidebar onto the canvas
   - Connect components by dragging between ports
   - Configure component parameters by clicking on them

3. **Test Your Flow**:
   - Click the "Run" button to execute the flow
   - View results in real-time as they stream

4. **Save and Share**:
   - Save flows to your account
   - Export flows as JSON
   - Deploy flows as APIs (coming soon)

## 🧩 Component Library

### Input / Output
- Chat Input/Output
- Text Input/Output
- Prompt Templates
- File Loaders

### Models
- 🦙 **Llama** (with dynamic I/O)
- Anthropic Claude
- Cohere
- HuggingFace

### Agents
- LangChain Agents
- CSV Agent
- SQL Agent

### Data
- API Request
- CSV/JSON Loaders
- Web Scraper

### Vector Stores
- Chroma
- Pinecone
- Weaviate

### Processing
- Text Splitter
- Embeddings
- Summarizer

### Logic
- Conditional Router
- Loop Iterator

### Helpers
- Calculator
- Search Tools

### Bundles
- RAG Bundle
- Q&A Bundle

## 🎯 Key Features

### Dynamic Node Connections
The Llama model node supports:
- **Dynamic Inputs**: Add up to 10 input connections
- **Agent Outputs**: Add up to 10 agent connections for multi-agent workflows
- **Visual Management**: Add/remove connections with intuitive + and × buttons

### Professional UI
- Modern slate blue and teal color scheme
- Smooth animations and transitions
- Double-click editing for templates
- Real-time visual feedback

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for the interactive API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
