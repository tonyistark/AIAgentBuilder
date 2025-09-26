from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI app
app = FastAPI(title="AI Agent Builder API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Agent Builder API is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/components")
async def get_components():
    # Return a simple component list for now
    return {
        "components": [
            {
                "id": "llama",
                "name": "Llama",
                "category": "models",
                "description": "Meta Llama language models",
                "inputs": [
                    {"name": "Input", "type": "Text"},
                    {"name": "System Message", "type": "Text"}
                ],
                "outputs": [
                    {"name": "Model Response", "type": "Text"}
                ],
                "fields": [
                    {"name": "Model Name", "type": "select", "options": ["llama-2-70b", "llama-2-13b", "llama-2-7b"]},
                    {"name": "Temperature", "type": "number"},
                    {"name": "Max Tokens", "type": "number"}
                ]
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
