from typing import Any, Dict, List
from app.components.base import BaseComponent, PortSchema, DataType


class LoopComponent(BaseComponent):
    """Loop component for iterating over data"""
    
    name = "loop"
    display_name = "Loop"
    description = "Iterate over a list of items"
    category = "Logic"
    icon = "Repeat"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="items",
            display_name="Items",
            type=DataType.DATA,
            description="List of items to iterate over",
            required=True
        ),
        PortSchema(
            name="operation",
            display_name="Operation",
            type=DataType.TEXT,
            description="Operation to perform on each item",
            default="passthrough",
            required=False
        ),
    ]
    
    outputs = [
        PortSchema(
            name="results",
            display_name="Results",
            type=DataType.DATA,
            description="Results from processing each item"
        ),
        PortSchema(
            name="count",
            display_name="Count",
            type=DataType.NUMBER,
            description="Number of items processed"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the component"""
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component"""
        items = inputs.get("items", [])
        operation = inputs.get("operation", "passthrough")
        
        if not isinstance(items, list):
            items = [items]
        
        results = []
        for i, item in enumerate(items):
            if operation == "passthrough":
                results.append(item)
            elif operation == "enumerate":
                results.append({"index": i, "value": item})
            elif operation == "stringify":
                results.append(str(item))
            else:
                results.append(item)
        
        return {
            "results": results,
            "count": len(results)
        }
