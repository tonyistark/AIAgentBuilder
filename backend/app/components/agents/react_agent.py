from typing import Any, Dict, List
from app.components.base import BaseComponent, PortSchema, DataType


class ReactAgentComponent(BaseComponent):
    """ReAct agent component for reasoning and acting"""
    
    name = "react_agent"
    display_name = "ReAct Agent"
    description = "Agent that reasons and acts to solve tasks"
    category = "Agents"
    icon = "Bot"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="task",
            display_name="Task",
            type=DataType.TEXT,
            description="Task for the agent to solve",
            required=True
        ),
        PortSchema(
            name="llm",
            display_name="Language Model",
            type=DataType.LANGUAGE_MODEL,
            description="LLM to use for reasoning",
            required=True
        ),
        PortSchema(
            name="tools",
            display_name="Tools",
            type=DataType.TOOL,
            description="Available tools for the agent",
            required=False,
            list=True
        ),
        PortSchema(
            name="max_iterations",
            display_name="Max Iterations",
            type=DataType.NUMBER,
            description="Maximum reasoning iterations",
            default=5,
            required=False
        ),
    ]
    
    outputs = [
        PortSchema(
            name="result",
            display_name="Result",
            type=DataType.TEXT,
            description="Agent's final answer"
        ),
        PortSchema(
            name="thoughts",
            display_name="Thoughts",
            type=DataType.DATA,
            description="Agent's reasoning process"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the component"""
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component"""
        task = inputs.get("task", "")
        llm = inputs.get("llm")
        tools = inputs.get("tools", [])
        max_iterations = inputs.get("max_iterations", 5)
        
        # Simple ReAct loop simulation
        thoughts = []
        
        for i in range(max_iterations):
            # Thought step
            thought = f"Iteration {i+1}: Analyzing task '{task}'"
            thoughts.append({"step": i+1, "thought": thought})
            
            # Action step (would use tools here)
            if tools:
                action = f"Using available tools: {len(tools)} tools"
                thoughts.append({"step": i+1, "action": action})
            
            # Observation step
            observation = "Gathered information from tools"
            thoughts.append({"step": i+1, "observation": observation})
            
            # Check if task is complete (simplified)
            if i >= 2:  # Simple completion condition
                break
        
        # Final answer
        result = f"Based on my analysis of '{task}', here is the result after {len(thoughts)} steps of reasoning."
        
        return {
            "result": result,
            "thoughts": thoughts,
            "iterations_used": i + 1
        }
