from typing import Dict, Any
from app.components.base import BaseComponent, ComponentSchema, PortSchema, DataType


class TextInputComponent(BaseComponent):
    """Simple text input component"""
    
    def get_schema(self) -> ComponentSchema:
        return ComponentSchema(
            name="text_input",
            display_name="Text Input",
            description="Input text data into the flow",
            category="Inputs",
            icon="Type",
            inputs=[
                PortSchema(
                    name="value",
                    display_name="Text",
                    type=DataType.TEXT,
                    description="Text value to input",
                    required=True
                )
            ],
            outputs=[
                PortSchema(
                    name="text",
                    display_name="Text",
                    type=DataType.TEXT,
                    description="Output text"
                )
            ]
        )
    
    async def build(self) -> None:
        """No build required for text input"""
        pass
    
    async def run(self) -> Dict[str, Any]:
        """Pass through the input text"""
        text = self.get_input("value")
        return {"text": text}
