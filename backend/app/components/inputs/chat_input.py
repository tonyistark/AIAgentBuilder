from typing import Dict, Any, Optional
from app.components.base import BaseComponent, ComponentSchema, PortSchema, DataType


class ChatInputComponent(BaseComponent):
    """Chat input component for conversational interfaces"""
    
    def get_schema(self) -> ComponentSchema:
        return ComponentSchema(
            name="chat_input",
            display_name="Chat Input",
            description="Input for chat messages with optional session management",
            category="Inputs",
            icon="MessageCircle",
            inputs=[
                PortSchema(
                    name="message",
                    display_name="Message",
                    type=DataType.TEXT,
                    description="User message",
                    required=True
                ),
                PortSchema(
                    name="session_id",
                    display_name="Session ID",
                    type=DataType.TEXT,
                    description="Session identifier for conversation context",
                    required=False
                ),
                PortSchema(
                    name="metadata",
                    display_name="Metadata",
                    type=DataType.DATA,
                    description="Additional metadata",
                    required=False,
                    advanced=True
                )
            ],
            outputs=[
                PortSchema(
                    name="message",
                    display_name="Message",
                    type=DataType.MESSAGE,
                    description="Formatted chat message"
                )
            ]
        )
    
    async def build(self) -> None:
        """No build required"""
        pass
    
    async def run(self) -> Dict[str, Any]:
        """Format input as chat message"""
        message_text = self.get_input("message")
        session_id = self.get_input("session_id")
        metadata = self.get_input("metadata") or {}
        
        message = {
            "role": "user",
            "content": message_text,
            "session_id": session_id,
            "metadata": metadata
        }
        
        return {"message": message}
