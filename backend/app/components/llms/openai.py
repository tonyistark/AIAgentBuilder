from typing import Dict, Any, Optional, AsyncGenerator
import openai
from app.components.base import StreamableComponent, ComponentSchema, PortSchema, DataType


class OpenAILLMComponent(StreamableComponent):
    """OpenAI language model component"""
    
    def get_schema(self) -> ComponentSchema:
        return ComponentSchema(
            name="openai_llm",
            display_name="OpenAI LLM",
            description="OpenAI language model for text generation",
            category="Language Models",
            icon="MessageSquare",
            inputs=[
                PortSchema(
                    name="prompt",
                    display_name="Prompt",
                    type=DataType.TEXT,
                    description="Input prompt for the model",
                    required=True
                ),
                PortSchema(
                    name="model",
                    display_name="Model",
                    type=DataType.TEXT,
                    description="Model to use",
                    default="gpt-4",
                    options=["gpt-4", "gpt-4-turbo-preview", "gpt-3.5-turbo", "gpt-3.5-turbo-16k"],
                    required=True
                ),
                PortSchema(
                    name="temperature",
                    display_name="Temperature",
                    type=DataType.NUMBER,
                    description="Sampling temperature (0-2)",
                    default=0.7,
                    required=False
                ),
                PortSchema(
                    name="max_tokens",
                    display_name="Max Tokens",
                    type=DataType.NUMBER,
                    description="Maximum tokens to generate",
                    default=1000,
                    required=False,
                    advanced=True
                ),
                PortSchema(
                    name="system_message",
                    display_name="System Message",
                    type=DataType.TEXT,
                    description="System message to set context",
                    required=False,
                    advanced=True
                ),
                PortSchema(
                    name="api_key",
                    display_name="API Key",
                    type=DataType.TEXT,
                    description="OpenAI API key (uses global if not provided)",
                    required=False,
                    advanced=True
                )
            ],
            outputs=[
                PortSchema(
                    name="response",
                    display_name="Response",
                    type=DataType.TEXT,
                    description="Generated text response"
                ),
                PortSchema(
                    name="usage",
                    display_name="Usage",
                    type=DataType.DATA,
                    description="Token usage information"
                )
            ]
        )
    
    async def build(self) -> None:
        """Initialize OpenAI client"""
        api_key = self.get_input("api_key") or self._context.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = openai.AsyncOpenAI(api_key=api_key)
    
    async def run(self) -> Dict[str, Any]:
        """Generate text using OpenAI"""
        prompt = self.get_input("prompt")
        model = self.get_input("model")
        temperature = self.get_input("temperature") or 0.7
        max_tokens = self.get_input("max_tokens") or 1000
        system_message = self.get_input("system_message")
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        
        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return {
            "response": response.choices[0].message.content,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }
    
    async def stream(self) -> AsyncGenerator[str, None]:
        """Stream text generation"""
        prompt = self.get_input("prompt")
        model = self.get_input("model")
        temperature = self.get_input("temperature") or 0.7
        max_tokens = self.get_input("max_tokens") or 1000
        system_message = self.get_input("system_message")
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        
        stream = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
