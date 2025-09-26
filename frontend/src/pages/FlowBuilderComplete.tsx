import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { Save, Play, Download, Upload, Loader2 } from 'lucide-react';
import CustomNode from '../components/nodes/CustomNode';
import toast from 'react-hot-toast';

const nodeTypes = {
  custom: CustomNode,
};

interface Component {
  name: string;
  display_name: string;
  description: string;
  category: string;
  icon: string;
  version: string;
  inputs: any[];
  outputs: any[];
}

const FlowBuilder: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [components, setComponents] = useState<Record<string, Component[]>>({});
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { project } = useReactFlow();

  // Fetch components from API
  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await axios.get('/api/v1/components/by-category');
      setComponents(response.data);
    } catch (error) {
      console.error('Failed to fetch components:', error);
      toast.error('Failed to load components');
    }
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const componentData = JSON.parse(type);
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${componentData.name}_${Date.now()}`,
        type: 'custom',
        position,
        data: { 
          label: componentData.display_name,
          description: componentData.description,
          color: getCategoryColor(componentData.category),
          component: componentData,
          config: {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  const onDragStart = (event: React.DragEvent, component: Component) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  const saveFlow = async () => {
    setIsLoading(true);
    try {
      const flowData = {
        name: flowName,
        data: { nodes, edges },
      };

      if (flowId) {
        await axios.put(`/api/v1/flows/${flowId}`, flowData);
        toast.success('Flow updated successfully');
      } else {
        const response = await axios.post('/api/v1/flows', flowData);
        setFlowId(response.data.id);
        toast.success('Flow saved successfully');
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
      toast.error('Failed to save flow');
    } finally {
      setIsLoading(false);
    }
  };

  const runFlow = async () => {
    if (!flowId) {
      toast.error('Please save the flow first');
      return;
    }

    setIsExecuting(true);
    try {
      // Connect to WebSocket for streaming results
      const ws = new WebSocket(`ws://localhost:8002/ws/flows/${flowId}/execute`);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({ inputs: {}, context: {} }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.event === 'token') {
          // Handle streaming tokens
          console.log('Token:', data.data);
        } else if (data.event === 'node_complete') {
          toast.success(`Node ${data.node_id} completed`);
        } else if (data.event === 'flow_complete') {
          toast.success('Flow execution completed');
          setIsExecuting(false);
        } else if (data.event === 'error') {
          toast.error(`Error: ${data.error}`);
          setIsExecuting(false);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
        setIsExecuting(false);
      };

      ws.onclose = () => {
        setIsExecuting(false);
      };
    } catch (error) {
      console.error('Failed to run flow:', error);
      toast.error('Failed to run flow');
      setIsExecuting(false);
    }
  };

  const exportFlow = () => {
    const data = {
      name: flowName,
      nodes,
      edges,
      version: '1.0.0',
      created_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Flow exported successfully');
  };

  const importFlow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setFlowName(data.name || 'Imported Flow');
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setFlowId(null); // Reset flow ID for imported flows
        toast.success('Flow imported successfully');
      } catch (error) {
        console.error('Failed to import flow:', error);
        toast.error('Invalid flow file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">LangFlow Clone</h1>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Flow name"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={saveFlow}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save</span>
            </button>
            
            <button
              onClick={runFlow}
              disabled={isExecuting}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Run</span>
            </button>
            
            <button
              onClick={exportFlow}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            
            <label className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={importFlow}
                className="hidden"
              />
            </label>
            
            <button 
              onClick={() => {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
              }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Components</h2>
          
          {Object.entries(components).map(([category, categoryComponents]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
              <div className="space-y-2">
                {categoryComponents.map((component) => (
                  <div
                    key={component.name}
                    className="p-3 bg-white rounded-lg shadow cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(event) => onDragStart(event, component)}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3"
                        style={{ backgroundColor: getCategoryColor(category) }}
                      >
                        {component.display_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{component.display_name}</div>
                        <div className="text-xs text-gray-500">{component.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Inputs': '#3b82f6',
    'Language Models': '#8b5cf6',
    'Vector Stores': '#a855f7',
    'Tools': '#06b6d4',
    'Outputs': '#10b981',
    'Processing': '#f59e0b',
    'Memory': '#f97316',
  };
  return colors[category] || '#6b7280';
}

const FlowBuilderWithProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
};

export default FlowBuilderWithProvider;
