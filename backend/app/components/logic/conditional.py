from typing import Any, Dict
from app.components.base import BaseComponent, PortSchema, DataType


class ConditionalComponent(BaseComponent):
    """Conditional logic component for branching flows"""
    
    name = "conditional"
    display_name = "Conditional"
    description = "Branch flow based on conditions"
    category = "Logic"
    icon = "GitBranch"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="condition",
            display_name="Condition",
            type=DataType.BOOLEAN,
            description="Condition to evaluate",
            required=True
        ),
        PortSchema(
            name="if_true",
            display_name="If True",
            type=DataType.ANY,
            description="Value to return if condition is true",
            required=True
        ),
        PortSchema(
            name="if_false",
            display_name="If False",
            type=DataType.ANY,
            description="Value to return if condition is false",
            required=True
        ),
    ]
    
    outputs = [
        PortSchema(
            name="result",
            display_name="Result",
            type=DataType.ANY,
            description="Selected value based on condition"
        ),
        PortSchema(
            name="branch_taken",
            display_name="Branch Taken",
            type=DataType.TEXT,
            description="Which branch was taken"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the component"""
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component"""
        condition = inputs.get("condition", False)
        if_true = inputs.get("if_true")
        if_false = inputs.get("if_false")
        
        if condition:
            return {
                "result": if_true,
                "branch_taken": "true"
            }
        else:
            return {
                "result": if_false,
                "branch_taken": "false"
            }
