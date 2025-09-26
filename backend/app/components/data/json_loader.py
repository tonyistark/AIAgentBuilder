from typing import Any, Dict
import json
from app.components.base import BaseComponent, PortSchema, DataType


class JSONLoaderComponent(BaseComponent):
    """JSON loader component for parsing JSON data"""
    
    name = "json_loader"
    display_name = "JSON Loader"
    description = "Parse JSON data"
    category = "Data"
    icon = "FileJson"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="json_text",
            display_name="JSON Text",
            type=DataType.TEXT,
            description="JSON data as text",
            required=True
        ),
    ]
    
    outputs = [
        PortSchema(
            name="data",
            display_name="Data",
            type=DataType.DATA,
            description="Parsed JSON data"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the component"""
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component"""
        json_text = inputs.get("json_text", "")
        
        if not json_text:
            return {"data": None}
        
        try:
            data = json.loads(json_text)
            return {"data": data}
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {str(e)}")
