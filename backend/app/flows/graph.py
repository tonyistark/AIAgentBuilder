from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
import uuid


class Node(BaseModel):
    """Represents a node in the flow graph"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    data: Dict[str, Any] = Field(default_factory=dict)
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})


class Edge(BaseModel):
    """Represents an edge connecting two nodes"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None


class FlowGraph:
    """Represents the flow as a directed graph"""
    
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[str, Edge] = {}
    
    def add_node(self, node: Node) -> None:
        """Add a node to the graph"""
        self.nodes[node.id] = node
    
    def add_edge(self, edge: Edge) -> None:
        """Add an edge to the graph"""
        # Validate nodes exist
        if edge.source not in self.nodes:
            raise ValueError(f"Source node {edge.source} not found")
        if edge.target not in self.nodes:
            raise ValueError(f"Target node {edge.target} not found")
        
        self.edges[edge.id] = edge
    
    def remove_node(self, node_id: str) -> None:
        """Remove a node and its connected edges"""
        if node_id in self.nodes:
            del self.nodes[node_id]
            
            # Remove connected edges
            edges_to_remove = [
                edge_id for edge_id, edge in self.edges.items()
                if edge.source == node_id or edge.target == node_id
            ]
            for edge_id in edges_to_remove:
                del self.edges[edge_id]
    
    def remove_edge(self, edge_id: str) -> None:
        """Remove an edge"""
        if edge_id in self.edges:
            del self.edges[edge_id]
    
    def get_incoming_edges(self, node_id: str) -> List[Edge]:
        """Get all edges coming into a node"""
        return [
            edge for edge in self.edges.values()
            if edge.target == node_id
        ]
    
    def get_outgoing_edges(self, node_id: str) -> List[Edge]:
        """Get all edges going out from a node"""
        return [
            edge for edge in self.edges.values()
            if edge.source == node_id
        ]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert graph to dictionary format"""
        return {
            "nodes": [node.dict() for node in self.nodes.values()],
            "edges": [edge.dict() for edge in self.edges.values()]
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FlowGraph":
        """Create graph from dictionary format"""
        graph = cls()
        
        for node_data in data.get("nodes", []):
            node = Node(**node_data)
            graph.add_node(node)
        
        for edge_data in data.get("edges", []):
            edge = Edge(**edge_data)
            graph.add_edge(edge)
        
        return graph
