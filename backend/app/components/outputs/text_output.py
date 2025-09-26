from typing import Any, Dict
from app.components.base import BaseComponent, PortSchema, DataType


class TextOutputComponent(BaseComponent):
    """Text output component for displaying results"""
    
    name = "text_output"
    display_name = "Text Output"
    description = "Output text data"
    category = "Outputs"
    icon = "FileText"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="text",
            display_name="Text",
            type=DataType.TEXT,
            description="Text to output",
            required=True
        ),
    ]
    
    outputs = []
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the component"""
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component"""
        text = inputs.get("text", "")
        
        # In a real implementation, this might save to file, display in UI, etc.
        # For now, just return the text
        return {
            "output": text,
            "status": "success"
        }
