from typing import Any, Dict, List, Optional
import chromadb
from chromadb.utils import embedding_functions
from app.components.base import BaseComponent, PortSchema, DataType


class ChromaDBComponent(BaseComponent):
    """ChromaDB vector store component for semantic search"""
    
    name = "chromadb"
    display_name = "ChromaDB"
    description = "Store and search embeddings using ChromaDB"
    category = "Vector Stores"
    icon = "Database"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="operation",
            display_name="Operation",
            type=DataType.TEXT,
            description="Operation to perform",
            default="search",
            options=["add", "search", "delete"],
            required=True
        ),
        PortSchema(
            name="collection_name",
            display_name="Collection Name",
            type=DataType.TEXT,
            description="Name of the collection",
            default="default",
            required=True
        ),
        PortSchema(
            name="documents",
            display_name="Documents",
            type=DataType.DATA,
            description="Documents to add (for add operation)",
            required=False
        ),
        PortSchema(
            name="query",
            display_name="Query",
            type=DataType.TEXT,
            description="Query text (for search operation)",
            required=False
        ),
        PortSchema(
            name="n_results",
            display_name="Number of Results",
            type=DataType.NUMBER,
            description="Number of results to return",
            default=5,
            required=False
        ),
        PortSchema(
            name="embeddings_model",
            display_name="Embeddings Model",
            type=DataType.TEXT,
            description="Model to use for embeddings",
            default="all-MiniLM-L6-v2",
            required=False
        ),
    ]
    
    outputs = [
        PortSchema(
            name="results",
            display_name="Results",
            type=DataType.DATA,
            description="Operation results"
        ),
        PortSchema(
            name="status",
            display_name="Status",
            type=DataType.TEXT,
            description="Operation status"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize ChromaDB client"""
        self.client = chromadb.Client()
        
        # Get or create collection
        collection_name = inputs.get("collection_name", "default")
        embeddings_model = inputs.get("embeddings_model", "all-MiniLM-L6-v2")
        
        # Use sentence transformers for embeddings
        embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=embeddings_model
        )
        
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_function
        )
        
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Execute the vector store operation"""
        operation = inputs.get("operation", "search")
        
        if operation == "add":
            return await self._add_documents(inputs)
        elif operation == "search":
            return await self._search_documents(inputs)
        elif operation == "delete":
            return await self._delete_documents(inputs)
        else:
            raise ValueError(f"Unknown operation: {operation}")
    
    async def _add_documents(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Add documents to the collection"""
        documents = inputs.get("documents", [])
        if not documents:
            return {
                "results": [],
                "status": "No documents provided"
            }
        
        # Extract texts and metadata
        if isinstance(documents, list) and all(isinstance(doc, str) for doc in documents):
            texts = documents
            metadatas = [{"index": i} for i in range(len(documents))]
            ids = [f"doc_{i}" for i in range(len(documents))]
        elif isinstance(documents, list) and all(isinstance(doc, dict) for doc in documents):
            texts = [doc.get("text", "") for doc in documents]
            metadatas = [doc.get("metadata", {}) for doc in documents]
            ids = [doc.get("id", f"doc_{i}") for i, doc in enumerate(documents)]
        else:
            raise ValueError("Documents must be a list of strings or dicts")
        
        # Add to collection
        self.collection.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        
        return {
            "results": {"added": len(texts)},
            "status": f"Added {len(texts)} documents"
        }
    
    async def _search_documents(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Search for similar documents"""
        query = inputs.get("query", "")
        n_results = inputs.get("n_results", 5)
        
        if not query:
            return {
                "results": [],
                "status": "No query provided"
            }
        
        # Perform search
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                formatted_results.append({
                    "document": doc,
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else None,
                    "id": results["ids"][0][i] if results["ids"] else None
                })
        
        return {
            "results": formatted_results,
            "status": f"Found {len(formatted_results)} results"
        }
    
    async def _delete_documents(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Delete documents from the collection"""
        # For now, we'll delete the entire collection
        collection_name = inputs.get("collection_name", "default")
        self.client.delete_collection(name=collection_name)
        
        return {
            "results": {"deleted": collection_name},
            "status": f"Deleted collection: {collection_name}"
        }
