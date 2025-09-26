from typing import Any, Dict, List, Optional, AsyncIterator
import anthropic
from app.components.base import StreamableComponent, PortSchema, DataType


class AnthropicLLMComponent(StreamableComponent):
    """Anthropic Claude LLM component for text generation"""
    
    name = "anthropic_llm"
    display_name = "Anthropic Claude"
    description = "Generate text using Anthropic's Claude models"
    category = "Language Models"
    icon = "MessageSquare"
    version = "1.0.0"
    
    inputs = [
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
            default="claude-3-opus-20240229",
            options=["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
            required=True
        ),
        PortSchema(
            name="temperature",
            display_name="Temperature",
            type=DataType.NUMBER,
            description="Sampling temperature (0-1)",
            default=0.7,
            required=False
        ),
        PortSchema(
            name="max_tokens",
            display_name="Max Tokens",
            type=DataType.NUMBER,
            description="Maximum tokens to generate",
            default=1000,
            required=False
        ),
        PortSchema(
            name="api_key",
            display_name="API Key",
            type=DataType.TEXT,
            description="Anthropic API key",
            required=False,
            advanced=True
        ),
    ]
    
    outputs = [
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
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the Anthropic client"""
        api_key = inputs.get("api_key") or self.context.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("Anthropic API key is required")
        
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component and generate text"""
        prompt = inputs.get("prompt", "")
        model = inputs.get("model", "claude-3-opus-20240229")
        temperature = inputs.get("temperature", 0.7)
        max_tokens = inputs.get("max_tokens", 1000)
        
        try:
            response = await self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return {
                "response": response.content[0].text,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens
                }
            }
        except Exception as e:
            raise RuntimeError(f"Anthropic API error: {str(e)}")
    
    async def stream(self, **inputs: Any) -> AsyncIterator[str]:
        """Stream the response token by token"""
        prompt = inputs.get("prompt", "")
        model = inputs.get("model", "claude-3-opus-20240229")
        temperature = inputs.get("temperature", 0.7)
        max_tokens = inputs.get("max_tokens", 1000)
        
        try:
            async with self.client.messages.stream(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception as e:
            raise RuntimeError(f"Anthropic API error: {str(e)}")
