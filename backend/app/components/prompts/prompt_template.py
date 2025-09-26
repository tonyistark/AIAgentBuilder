from typing import Any, Dict, List
import re
from app.components.base import BaseComponent, PortSchema, DataType


class PromptTemplateComponent(BaseComponent):
    """Prompt template component for formatting prompts with variables"""
    
    name = "prompt_template"
    display_name = "Prompt Template"
    description = "Create prompts with variable substitution"
    category = "Prompts"
    icon = "FileText"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="template",
            display_name="Template",
            type=DataType.TEXT,
            description="Prompt template with {variables}",
            required=True
        ),
        PortSchema(
            name="variables",
            display_name="Variables",
            type=DataType.DATA,
            description="Dictionary of variables to substitute",
            required=False
        ),
    ]
    
    outputs = [
        PortSchema(
            name="prompt",
            display_name="Prompt",
            type=DataType.TEXT,
            description="Formatted prompt"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the component"""
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component"""
        template = inputs.get("template", "")
        variables = inputs.get("variables", {})
        
        # Find all variables in the template
        pattern = r'\{(\w+)\}'
        variable_names = re.findall(pattern, template)
        
        # Format the template
        formatted_prompt = template
        for var_name in variable_names:
            if var_name in variables:
                formatted_prompt = formatted_prompt.replace(
                    f"{{{var_name}}}", 
                    str(variables[var_name])
                )
        
        return {
            "prompt": formatted_prompt,
            "used_variables": variable_names
        }
