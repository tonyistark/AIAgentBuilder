# LangFlow Clone

A visual AI workflow builder application that replicates Langflow's core functionality. Build, test, and deploy AI workflows through a drag-and-drop interface with comprehensive LLM integrations.

## Features

- 🎨 **Visual Flow Builder**: Drag-and-drop interface for building AI workflows
- 🤖 **LLM Integrations**: Support for OpenAI, Anthropic, Google, and more
- 🔄 **Real-time Execution**: Stream results as workflows execute
- 💾 **Persistence**: Save and load workflows with version control
- 🔐 **Authentication**: Secure user authentication and API key management
- 🚀 **Deployment Ready**: Export and deploy workflows as APIs

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

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (optional, SQLite by default)
- Redis (for Celery, optional)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies using uv:
```bash
pip install uv
uv pip install -e .
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API keys and configuration

5. Run the backend server:
```bash
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Project Structure

```
langflow-clone/
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

## Component Types

### Inputs/Outputs
- Text Input/Output
- Chat Input/Output
- File Upload
- API Response

### Language Models
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google Vertex AI
- Azure OpenAI
- Local Models (Ollama)

### Processing
- Text Splitter
- Data Parser
- Type Converter
- Conditional Router

### Tools
- Web Search
- Calculator
- Python Code
- SQL Query

### Memory/Storage
- Chat Memory
- Vector Store
- Cache

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for the interactive API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
