from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from enum import Enum
import uuid


class DataType(str, Enum):
    """Supported data types for component ports"""
    TEXT = "Text"
    NUMBER = "Number"
    BOOLEAN = "Boolean"
    DATA = "Data"
    DATAFRAME = "DataFrame"
    EMBEDDINGS = "Embeddings"
    LANGUAGE_MODEL = "LanguageModel"
    MEMORY = "Memory"
    MESSAGE = "Message"
    TOOL = "Tool"
    VECTOR_STORE = "VectorStore"
    ANY = "Any"


class PortSchema(BaseModel):
    """Schema for component input/output ports"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    display_name: str
    type: DataType
    description: Optional[str] = None
    required: bool = True
    multiple: bool = False
    default: Optional[Any] = None
    options: Optional[List[Any]] = None  # For select/dropdown inputs
    advanced: bool = False  # Hide in basic view


class ComponentSchema(BaseModel):
    """Schema for component metadata"""
    name: str
    display_name: str
    description: str
    category: str
    icon: str  # Lucide icon name
    version: str = "1.0.0"
    inputs: List[PortSchema] = []
    outputs: List[PortSchema] = []
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "openai_llm",
                "display_name": "OpenAI LLM",
                "description": "OpenAI language model component",
                "category": "Language Models",
                "icon": "MessageSquare",
                "inputs": [
                    {
                        "name": "prompt",
                        "display_name": "Prompt",
                        "type": "Text",
                        "required": True
                    }
                ],
                "outputs": [
                    {
                        "name": "response",
                        "display_name": "Response",
                        "type": "Text"
                    }
                ]
            }
        }


class BaseComponent(ABC):
    """Base class for all components"""
    
    def __init__(self):
        self.schema = self.get_schema()
        self._inputs: Dict[str, Any] = {}
        self._outputs: Dict[str, Any] = {}
        self._context: Dict[str, Any] = {}
        
    @abstractmethod
    def get_schema(self) -> ComponentSchema:
        """Return component schema with metadata"""
        pass
    
    def set_input(self, name: str, value: Any) -> None:
        """Set input value"""
        # Validate input exists in schema
        input_names = [port.name for port in self.schema.inputs]
        if name not in input_names:
            raise ValueError(f"Input '{name}' not found in component schema")
        self._inputs[name] = value
    
    def get_input(self, name: str) -> Any:
        """Get input value"""
        return self._inputs.get(name)
    
    def set_context(self, context: Dict[str, Any]) -> None:
        """Set execution context (e.g., global variables, credentials)"""
        self._context = context
    
    def validate_inputs(self) -> None:
        """Validate all required inputs are present"""
        for port in self.schema.inputs:
            if port.required and port.name not in self._inputs:
                raise ValueError(f"Required input '{port.name}' is missing")
    
    @abstractmethod
    async def build(self) -> None:
        """Build/initialize component (e.g., create clients, load models)"""
        pass
    
    @abstractmethod
    async def run(self) -> Dict[str, Any]:
        """Execute component logic and return outputs"""
        pass
    
    async def execute(self, inputs: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Main execution method called by the flow executor"""
        # Set inputs
        for name, value in inputs.items():
            self.set_input(name, value)
        
        # Set context if provided
        if context:
            self.set_context(context)
        
        # Validate inputs
        self.validate_inputs()
        
        # Build component
        await self.build()
        
        # Run component
        outputs = await self.run()
        
        # Store outputs
        self._outputs = outputs
        
        return outputs


class StreamableComponent(BaseComponent):
    """Base class for components that support streaming output"""
    
    @abstractmethod
    async def stream(self):
        """Stream output data"""
        pass
