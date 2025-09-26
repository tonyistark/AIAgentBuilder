import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, Download, Upload } from 'lucide-react';
import axios from 'axios';

// Simple component library
const componentLibrary = [
  {
    id: 'text-input',
    name: 'Text Input',
  },
  {
    id: 'text-output',
    name: 'Output text data',
    category: 'Outputs',
    color: getCategoryColor('Outputs'),
const CustomNode = ({ data, isConnectable }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[180px] relative">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <div className="flex items-center">
        <div 
          className="rounded-full w-10 h-10 flex justify-center items-center text-white font-bold mr-3"
          style={{ backgroundColor: data.color }}
        >
          {data.label.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.description}</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const SimpleFlowBuilder: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState('My Flow');
  const { project } = useReactFlow();

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
        id: `${componentData.id}_${Date.now()}`,
        type: 'custom',
        position,
        data: { 
          label: componentData.name,
          description: componentData.description,
          color: componentData.color,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  const onDragStart = (event: React.DragEvent, component: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  const saveFlow = async () => {
    const flowData = {
      name: flowName,
      data: { nodes, edges },
    };
    
    try {
      const response = await axios.post('/api/v1/flows', flowData);
      alert(`Flow saved with ID: ${response.data.id}`);
    } catch (error) {
      console.error('Failed to save flow:', error);
      alert('Failed to save flow');
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
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">LangFlow Clone</h1>
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
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            
            <button
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
            
            <button
              onClick={exportFlow}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            
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
        <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Components</h2>
          <div className="space-y-2">
            {componentLibrary.map((component) => (
              <div
                key={component.id}
                className="p-3 bg-white rounded-lg shadow cursor-move hover:shadow-md transition-shadow"
                draggable
                onDragStart={(event) => onDragStart(event, component)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3"
                    style={{ backgroundColor: component.color }}
                  >
                    {component.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{component.name}</div>
                    <div className="text-xs text-gray-500">{component.category}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <MiniMap />
            <Panel position="top-left">
              <div className="bg-white p-2 rounded shadow text-sm">
                Drag components from the sidebar to build your flow
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

const SimpleFlowBuilderWithProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <SimpleFlowBuilder />
    </ReactFlowProvider>
  );
};

export default SimpleFlowBuilderWithProvider;
