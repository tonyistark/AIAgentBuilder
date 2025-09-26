from typing import Any, Dict, List
from app.components.base import BaseComponent, PortSchema, DataType


class TextSplitterComponent(BaseComponent):
    """Text splitter component for chunking text"""
    
    name = "text_splitter"
    display_name = "Text Splitter"
    description = "Split text into chunks"
    category = "Processing"
    icon = "Split"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="text",
            display_name="Text",
            type=DataType.TEXT,
            description="Text to split",
            required=True
        ),
        PortSchema(
            name="chunk_size",
            display_name="Chunk Size",
            type=DataType.NUMBER,
            description="Size of each chunk",
            default=1000,
            required=False
        ),
        PortSchema(
            name="chunk_overlap",
            display_name="Chunk Overlap",
            type=DataType.NUMBER,
            description="Overlap between chunks",
            default=200,
            required=False
        ),
    ]
    
    outputs = [
        PortSchema(
            name="chunks",
            display_name="Chunks",
            type=DataType.DATA,
            description="Text chunks"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the component"""
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component"""
        text = inputs.get("text", "")
        chunk_size = inputs.get("chunk_size", 1000)
        chunk_overlap = inputs.get("chunk_overlap", 200)
        
        # Simple text splitting logic
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append({
                "text": chunk,
                "start": start,
                "end": min(end, len(text))
            })
            start = end - chunk_overlap
        
        return {
            "chunks": chunks,
            "total_chunks": len(chunks)
        }
