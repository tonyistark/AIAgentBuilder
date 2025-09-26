from typing import Any, Dict, List, Optional
import httpx
from app.components.base import BaseComponent, PortSchema, DataType


class WebSearchComponent(BaseComponent):
    """Web search tool component"""
    
    name = "web_search"
    display_name = "Web Search"
    description = "Search the web for information"
    category = "Tools"
    icon = "Search"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="query",
            display_name="Query",
            type=DataType.TEXT,
            description="Search query",
            required=True
        ),
        PortSchema(
            name="num_results",
            display_name="Number of Results",
            type=DataType.NUMBER,
            description="Number of results to return",
            default=5,
            required=False
        ),
        PortSchema(
            name="search_engine",
            display_name="Search Engine",
            type=DataType.TEXT,
            description="Search engine to use",
            default="duckduckgo",
            options=["duckduckgo", "google", "bing"],
            required=False
        ),
        PortSchema(
            name="api_key",
            display_name="API Key",
            type=DataType.TEXT,
            description="API key for search engine (if required)",
            required=False,
            advanced=True
        ),
    ]
    
    outputs = [
        PortSchema(
            name="results",
            display_name="Results",
            type=DataType.DATA,
            description="Search results"
        ),
        PortSchema(
            name="summary",
            display_name="Summary",
            type=DataType.TEXT,
            description="Summary of search results"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the search client"""
        self.client = httpx.AsyncClient()
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Execute the web search"""
        query = inputs.get("query", "")
        num_results = inputs.get("num_results", 5)
        search_engine = inputs.get("search_engine", "duckduckgo")
        
        if not query:
            return {
                "results": [],
                "summary": "No query provided"
            }
        
        try:
            if search_engine == "duckduckgo":
                results = await self._search_duckduckgo(query, num_results)
            else:
                # For other search engines, we'd need API keys
                results = []
                summary = f"{search_engine} search not implemented yet"
            
            # Create summary
            if results:
                summary = f"Found {len(results)} results for '{query}':\n"
                for i, result in enumerate(results[:3], 1):
                    summary += f"{i}. {result.get('title', 'No title')}\n"
            else:
                summary = f"No results found for '{query}'"
            
            return {
                "results": results,
                "summary": summary
            }
        except Exception as e:
            return {
                "results": [],
                "summary": f"Search error: {str(e)}"
            }
    
    async def _search_duckduckgo(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """Search using DuckDuckGo (no API key required)"""
        # DuckDuckGo instant answer API
        url = "https://api.duckduckgo.com/"
        params = {
            "q": query,
            "format": "json",
            "no_html": "1",
            "skip_disambig": "1"
        }
        
        try:
            response = await self.client.get(url, params=params)
            data = response.json()
            
            results = []
            
            # Extract abstract if available
            if data.get("Abstract"):
                results.append({
                    "title": data.get("Heading", "DuckDuckGo Result"),
                    "snippet": data.get("Abstract"),
                    "url": data.get("AbstractURL", ""),
                    "source": "DuckDuckGo Abstract"
                })
            
            # Extract related topics
            for topic in data.get("RelatedTopics", [])[:num_results-1]:
                if isinstance(topic, dict) and "Text" in topic:
                    results.append({
                        "title": topic.get("Text", "").split(" - ")[0],
                        "snippet": topic.get("Text", ""),
                        "url": topic.get("FirstURL", ""),
                        "source": "DuckDuckGo Related"
                    })
            
            return results[:num_results]
        except Exception as e:
            raise RuntimeError(f"DuckDuckGo search error: {str(e)}")
