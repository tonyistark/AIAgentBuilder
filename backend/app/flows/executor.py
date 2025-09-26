from typing import Dict, List, Any, Optional, Set, AsyncGenerator
from collections import defaultdict, deque
import asyncio
import uuid
from datetime import datetime
import logging
from sqlalchemy.orm import Session

from app.components.base import BaseComponent, StreamableComponent
from app.flows.graph import FlowGraph, Node, Edge
from app.models.models import Variable
from app.core.security import decrypt_value

logger = logging.getLogger(__name__)


class FlowExecutor:
    """Executes flows by building a DAG and running components in topological order"""
    
    def __init__(self, flow_data: Dict[str, Any], context: Optional[Dict[str, Any]] = None, db: Optional[Session] = None, user_id: Optional[str] = None):
        self.flow_data = flow_data
        self.context = context or {}
        self.graph = FlowGraph()
        self.results: Dict[str, Any] = {}
        self.execution_id = str(uuid.uuid4())
        self.status = "pending"
        self.error = None
        self.db = db
        self.user_id = user_id
        
        # Load variables into context if db and user_id provided
        if db and user_id:
            self._load_variables_to_context()
        
    def build_graph(self) -> None:
        """Build execution graph from flow data"""
        nodes = self.flow_data.get("nodes", [])
        edges = self.flow_data.get("edges", [])
        
        # Add nodes to graph
        for node_data in nodes:
            node = Node(
                id=node_data["id"],
                type=node_data["type"],
                data=node_data.get("data", {}),
                position=node_data.get("position", {"x": 0, "y": 0})
            )
            self.graph.add_node(node)
        
        # Add edges to graph
        for edge_data in edges:
            edge = Edge(
                id=edge_data["id"],
                source=edge_data["source"],
                target=edge_data["target"],
                source_handle=edge_data.get("sourceHandle"),
                target_handle=edge_data.get("targetHandle")
            )
            self.graph.add_edge(edge)
    
    def topological_sort(self) -> List[str]:
        """Get topological ordering of nodes for execution"""
        # Calculate in-degree for each node
        in_degree = defaultdict(int)
        adjacency = defaultdict(list)
        
        for edge in self.graph.edges.values():
            in_degree[edge.target] += 1
            adjacency[edge.source].append(edge.target)
        
        # Find all nodes with no incoming edges
        queue = deque()
        for node_id in self.graph.nodes:
            if in_degree[node_id] == 0:
                queue.append(node_id)
        
        # Process nodes in topological order
        sorted_nodes = []
        while queue:
            node_id = queue.popleft()
            sorted_nodes.append(node_id)
            
            # Reduce in-degree for neighbors
            for neighbor in adjacency[node_id]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        # Check for cycles
        if len(sorted_nodes) != len(self.graph.nodes):
            raise ValueError("Flow contains cycles")
        
        return sorted_nodes
    
    def get_node_inputs(self, node_id: str) -> Dict[str, Any]:
        """Get inputs for a node from connected nodes' outputs"""
        inputs = {}
        node = self.graph.nodes[node_id]
        
        # Get incoming edges
        incoming_edges = [
            edge for edge in self.graph.edges.values()
            if edge.target == node_id
        ]
        
        for edge in incoming_edges:
            source_node = self.graph.nodes[edge.source]
            source_results = self.results.get(edge.source, {})
            
            # Map output from source to input of target
            if edge.source_handle and edge.target_handle:
                if edge.source_handle in source_results:
                    inputs[edge.target_handle] = source_results[edge.source_handle]
        
        # Add any static inputs from node data
        if "inputs" in node.data:
            inputs.update(node.data["inputs"])
        
        return inputs
    
    async def execute_node(self, node_id: str) -> Dict[str, Any]:
        """Execute a single node"""
        node = self.graph.nodes[node_id]
        
        # Get component class
        component_class = self.get_component_class(node.type)
        if not component_class:
            raise ValueError(f"Unknown component type: {node.type}")
        
        # Create component instance
        component = component_class()
        
        # Get inputs
        inputs = self.get_node_inputs(node_id)
        
        # Execute component
        try:
            logger.info(f"Executing node {node_id} ({node.type})")
            outputs = await component.execute(inputs, self.context)
            self.results[node_id] = outputs
            return outputs
        except Exception as e:
            logger.error(f"Error executing node {node_id}: {str(e)}")
            raise
    
    def get_component_class(self, component_type: str):
        """Get component class by type"""
        # from app.components.registry import ComponentRegistry
        # try:
        #     return ComponentRegistry.get(component_type)
        # except ValueError:
        #     return None
        return None
    
    async def execute(self) -> Dict[str, Any]:
        """Execute the entire flow"""
        try:
            self.status = "running"
            
            # Build graph
            self.build_graph()
            
            # Get execution order
            execution_order = self.topological_sort()
            
            # Execute nodes in order
            for node_id in execution_order:
                await self.execute_node(node_id)
            
            self.status = "completed"
            return self.results
            
        except Exception as e:
            self.status = "failed"
            self.error = str(e)
            logger.error(f"Flow execution failed: {str(e)}")
            raise
    
    async def execute_stream(self) -> AsyncGenerator[Dict[str, Any], None]:
        """Execute flow with streaming support"""
        try:
            self.status = "running"
            
            # Build graph
            self.build_graph()
            
            # Get execution order
            execution_order = self.topological_sort()
            
            # Execute nodes in order
            for node_id in execution_order:
                node = self.graph.nodes[node_id]
                component_class = self.get_component_class(node.type)
                
                if not component_class:
                    raise ValueError(f"Unknown component type: {node.type}")
                
                component = component_class()
                inputs = self.get_node_inputs(node_id)
                
                # Check if component supports streaming
                if isinstance(component, StreamableComponent) and hasattr(component, 'stream'):
                    # Set up component
                    for name, value in inputs.items():
                        component.set_input(name, value)
                    component.set_context(self.context)
                    component.validate_inputs()
                    await component.build()
                    
                    # Stream results
                    async for chunk in component.stream():
                        yield {
                            "event": "token",
                            "node_id": node_id,
                            "data": chunk
                        }
                    
                    # Get final results
                    outputs = await component.run()
                    self.results[node_id] = outputs
                else:
                    # Non-streaming execution
                    outputs = await component.execute(inputs, self.context)
                    self.results[node_id] = outputs
                    
                    yield {
                        "event": "node_complete",
                        "node_id": node_id,
                        "data": outputs
                    }
            
            self.status = "completed"
            yield {
                "event": "flow_complete",
                "data": self.results
            }
            
        except Exception as e:
            self.status = "failed"
            self.error = str(e)
            logger.error(f"Flow execution failed: {str(e)}")
            yield {
                "event": "error",
                "error": str(e)
            }
            raise
