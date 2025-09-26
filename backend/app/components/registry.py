from typing import Dict, Type, List
from app.components.base import BaseComponent

# Import all component types
from app.components.inputs.text_input import TextInputComponent
from app.components.inputs.chat_input import ChatInputComponent
from app.components.llms.openai import OpenAILLMComponent
from app.components.llms.anthropic import AnthropicLLMComponent
from app.components.vectorstores.chromadb import ChromaDBComponent
from app.components.tools.web_search import WebSearchComponent


class ComponentRegistry:
    """Registry for all available components"""
    
    _components: Dict[str, Type[BaseComponent]] = {}
    
    @classmethod
    def register(cls, component_class: Type[BaseComponent]) -> None:
        """Register a component class"""
        cls._components[component_class.name] = component_class
    
    @classmethod
    def get(cls, name: str) -> Type[BaseComponent]:
        """Get a component class by name"""
        if name not in cls._components:
            raise ValueError(f"Component '{name}' not found in registry")
        return cls._components[name]
    
    @classmethod
    def list_all(cls) -> List[Dict[str, any]]:
        """List all registered components with their metadata"""
        components = []
        for name, component_class in cls._components.items():
            components.append({
                "name": component_class.name,
                "display_name": component_class.display_name,
                "description": component_class.description,
                "category": component_class.category,
                "icon": component_class.icon,
                "version": component_class.version,
                "inputs": [port.dict() for port in component_class.inputs],
                "outputs": [port.dict() for port in component_class.outputs],
            })
        return components
    
    @classmethod
    def get_by_category(cls) -> Dict[str, List[Dict[str, any]]]:
        """Get components grouped by category"""
        by_category = {}
        for component in cls.list_all():
            category = component["category"]
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(component)
        return by_category


# Register all components
ComponentRegistry.register(TextInputComponent)
ComponentRegistry.register(ChatInputComponent)
ComponentRegistry.register(OpenAILLMComponent)
ComponentRegistry.register(AnthropicLLMComponent)
ComponentRegistry.register(ChromaDBComponent)
ComponentRegistry.register(WebSearchComponent)
