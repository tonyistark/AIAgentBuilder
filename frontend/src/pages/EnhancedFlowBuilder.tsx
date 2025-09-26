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
  MiniMap,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Save, Play, Download, Upload, Settings, Loader2, X, Key, 
  Search, ChevronDown, ChevronRight, Brain, Database,
  FileText, GitBranch, Cpu, MessageSquare, Moon, Sun,
  Trash2, HelpCircle, Zap
} from 'lucide-react';
import axios from 'axios';
import ConfigPanel from '../components/ConfigPanel';
import VariablesPanel from '../components/VariablesPanel';
import toast from 'react-hot-toast';

// Enhanced component library with all LangFlow categories
const componentLibrary = [
  // I/O Components
  {
    id: 'text-input',
    name: 'Text Input',
    category: 'I/O',
    description: 'Input text data',
    color: '#3b82f6',
    inputs: [],
    outputs: [{ name: 'text', type: 'Text' }],
  },
  {
    id: 'chat-input',
    name: 'Chat Input',
    category: 'I/O',
    description: 'Chat message input',
    color: '#3b82f6',
    inputs: [],
    outputs: [{ name: 'message', type: 'Message' }],
  },
  {
    id: 'text-output',
    name: 'Text Output',
    category: 'I/O',
    description: 'Output text data',
    color: '#3b82f6',
    icon: FileText,
    inputs: [{ name: 'text', type: 'Text' }],
    outputs: [],
  },
  {
    id: 'chat-output',
    name: 'Chat Output',
    category: 'I/O',
    description: 'Display chat response',
    color: '#3b82f6',
    icon: MessageSquare,
    inputs: [{ name: 'message', type: 'Message' }],
    outputs: [],
  },
  {
    id: 'file-input',
    name: 'File Input',
    category: 'I/O',
    description: 'Load file content',
    color: '#3b82f6',
    inputs: [],
    outputs: [{ name: 'content', type: 'Text' }],
  },
  
  // Prompts
  {
    id: 'prompt-template',
    name: 'Prompt Template',
    category: 'Prompts',
    description: 'Create prompts with variables',
    color: '#ec4899',
    inputs: [
      { name: 'template', type: 'Text' },
      { name: 'variables', type: 'Data' }
    ],
    outputs: [{ name: 'prompt', type: 'Text' }],
  },
  {
    id: 'few-shot-prompt',
    name: 'Few Shot Prompt',
    category: 'Prompts',
    description: 'Create few-shot prompts',
    color: '#ec4899',
    inputs: [{ name: 'examples', type: 'Data' }],
    outputs: [{ name: 'prompt', type: 'Text' }],
  },
  
  // Models
  {
    id: 'openai-llm',
    name: 'OpenAI',
    category: 'Models',
    description: 'OpenAI language model',
    color: '#8b5cf6',
    inputs: [{ name: 'prompt', type: 'Text' }],
    outputs: [{ name: 'response', type: 'Text' }],
  },
  {
    id: 'anthropic-llm',
    name: 'Anthropic Claude',
    category: 'Models',
    description: 'Anthropic Claude model',
    color: '#8b5cf6',
    inputs: [{ name: 'prompt', type: 'Text' }],
    outputs: [{ name: 'response', type: 'Text' }],
  },
  {
    id: 'huggingface-llm',
    name: 'HuggingFace',
    category: 'Models',
    description: 'HuggingFace models',
    color: '#8b5cf6',
    inputs: [{ name: 'prompt', type: 'Text' }],
    outputs: [{ name: 'response', type: 'Text' }],
  },
  
  // Data
  {
    id: 'csv-loader',
    name: 'CSV Loader',
    category: 'Data',
    description: 'Load CSV data',
    color: '#06b6d4',
    inputs: [{ name: 'csv_data', type: 'Text' }],
    outputs: [
      { name: 'data', type: 'Data' },
      { name: 'columns', type: 'Data' }
    ],
  },
  {
    id: 'json-loader',
    name: 'JSON Loader',
    category: 'Data',
    description: 'Parse JSON data',
    color: '#06b6d4',
    inputs: [{ name: 'json_text', type: 'Text' }],
    outputs: [{ name: 'data', type: 'Data' }],
  },
  {
    id: 'api-request',
    name: 'API Request',
    category: 'Data',
    description: 'Make HTTP requests',
    color: '#06b6d4',
    inputs: [
      { name: 'url', type: 'Text' },
      { name: 'method', type: 'Text' }
    ],
    outputs: [{ name: 'response', type: 'Data' }],
  },
  
  // Processing
  {
    id: 'text-splitter',
    name: 'Text Splitter',
    category: 'Processing',
    description: 'Split text into chunks',
    color: '#f59e0b',
    inputs: [{ name: 'text', type: 'Text' }],
    outputs: [{ name: 'chunks', type: 'Data' }],
  },
  {
    id: 'text-embeddings',
    name: 'Text Embeddings',
    category: 'Processing',
    description: 'Generate text embeddings',
    color: '#f59e0b',
    inputs: [{ name: 'text', type: 'Text' }],
    outputs: [{ name: 'embeddings', type: 'Embeddings' }],
  },
  {
    id: 'text-summarizer',
    name: 'Summarizer',
    category: 'Processing',
    description: 'Summarize text content',
    color: '#f59e0b',
    inputs: [{ name: 'text', type: 'Text' }],
    outputs: [{ name: 'summary', type: 'Text' }],
  },
  
  // Vector Stores
  {
    id: 'chromadb',
    name: 'ChromaDB',
    category: 'Vector Stores',
    description: 'ChromaDB vector store',
    color: '#a855f7',
    inputs: [
      { name: 'operation', type: 'Text' },
      { name: 'documents', type: 'Data' }
    ],
    outputs: [{ name: 'results', type: 'Data' }],
  },
  {
    id: 'pinecone',
    name: 'Pinecone',
    category: 'Vector Stores',
    description: 'Pinecone vector database',
    color: '#a855f7',
    inputs: [
      { name: 'vectors', type: 'Embeddings' },
      { name: 'query', type: 'Text' }
    ],
    outputs: [{ name: 'results', type: 'Data' }],
  },
  {
    id: 'weaviate',
    name: 'Weaviate',
    category: 'Vector Stores',
    description: 'Weaviate vector search',
    color: '#a855f7',
    inputs: [{ name: 'query', type: 'Text' }],
    outputs: [{ name: 'results', type: 'Data' }],
  },
  
  // Agents
  {
    id: 'react-agent',
    name: 'ReAct Agent',
    category: 'Agents',
    description: 'Reasoning and acting agent',
    color: '#ef4444',
    inputs: [
      { name: 'task', type: 'Text' },
      { name: 'tools', type: 'Tool' }
    ],
    outputs: [
      { name: 'result', type: 'Text' },
      { name: 'thoughts', type: 'Data' }
    ],
  },
  {
    id: 'conversational-agent',
    name: 'Conversational Agent',
    category: 'Agents',
    description: 'Chat-based agent',
    color: '#ef4444',
    inputs: [
      { name: 'message', type: 'Message' },
      { name: 'memory', type: 'Memory' }
    ],
    outputs: [{ name: 'response', type: 'Message' }],
  },
  
  // Logic
  {
    id: 'conditional',
    name: 'Conditional',
    category: 'Logic',
    description: 'If-then-else logic',
    color: '#10b981',
    inputs: [
      { name: 'condition', type: 'Boolean' },
      { name: 'if_true', type: 'Any' },
      { name: 'if_false', type: 'Any' }
    ],
    outputs: [{ name: 'result', type: 'Any' }],
  },
  {
    id: 'loop',
    name: 'Loop',
    category: 'Logic',
    description: 'Iterate over items',
    color: '#10b981',
    inputs: [
      { name: 'items', type: 'Data' },
      { name: 'operation', type: 'Text' }
    ],
    outputs: [
      { name: 'results', type: 'Data' },
      { name: 'count', type: 'Number' }
    ],
  },
  {
    id: 'merge',
    name: 'Merge',
    category: 'Logic',
    description: 'Merge multiple inputs',
    color: '#10b981',
    inputs: [
      { name: 'input1', type: 'Any' },
      { name: 'input2', type: 'Any' }
    ],
    outputs: [{ name: 'merged', type: 'Data' }],
  },
];

// Port colors by type
const portColors: Record<string, string> = {
  Text: '#3b82f6',
  Message: '#6366f1',
  Data: '#ef4444',
  Number: '#10b981',
  Boolean: '#f59e0b',
  Embeddings: '#8b5cf6',
  Tool: '#06b6d4',
  Memory: '#ec4899',
  Any: '#6b7280',
};

// Get icon component
const getIcon = (category: string) => {
  const icons: Record<string, any> = {
    'I/O': MessageSquare,
    'Prompts': FileText,
    'Models': Brain,
    'Data': Database,
    'Processing': Cpu,
    'Vector Stores': Database,
    'Agents': Zap,
    'Logic': GitBranch,
  };
  const IconComponent = icons[category] || MessageSquare;
  return <IconComponent className="w-5 h-5" />;
};

// Enhanced custom node with professional styling
const CustomNode = ({ data, isConnectable, selected }: any) => {
  const [showConfig, setShowConfig] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div 
        className={`
          relative bg-white rounded-lg shadow-sm border transition-all duration-200
          ${selected ? 'ring-2 ring-indigo-500 border-transparent shadow-lg' : 'border-gray-200 hover:shadow-md'}
          ${isHovered ? 'transform scale-105' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ minWidth: '240px' }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 rounded-t-lg flex items-center justify-between"
          style={{ backgroundColor: data.color + '15' }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: data.color + '30' }}
            >
              {getIcon(data.category || 'I/O')}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{data.label}</h3>
              <p className="text-xs text-gray-600">{data.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Input handles */}
        {data.inputs?.map((input: any, index: number) => (
          <div key={`input-${input.name}`} className="absolute left-0" style={{ top: `${60 + index * 30}px` }}>
            <Handle
              type="target"
              position={Position.Left}
              id={input.name}
              style={{
                background: portColors[input.type] || '#555',
                width: '12px',
                height: '12px',
                border: '2px solid white',
                left: '-6px',
              }}
              isConnectable={isConnectable}
            />
            <span className="absolute left-3 text-xs text-gray-500 whitespace-nowrap" style={{ top: '-7px' }}>
              {input.name}
            </span>
          </div>
        ))}

        {/* Output handles */}
        {data.outputs?.map((output: any, index: number) => (
          <div key={`output-${output.name}`} className="absolute right-0" style={{ top: `${60 + index * 30}px` }}>
            <Handle
              type="source"
              position={Position.Right}
              id={output.name}
              style={{
                background: portColors[output.type] || '#555',
                width: '12px',
                height: '12px',
                border: '2px solid white',
                right: '-6px',
              }}
              isConnectable={isConnectable}
            />
            <span className="absolute right-3 text-xs text-gray-500 whitespace-nowrap" style={{ top: '-7px' }}>
              {output.name}
            </span>
          </div>
        ))}

        {/* Configuration preview */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              {Object.entries(data.config).slice(0, 2).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span className="text-gray-700 truncate ml-2" style={{ maxWidth: '120px' }}>
                    {String(value)}
                  </span>
                </div>
              ))}
              {Object.keys(data.config).length > 2 && (
                <div className="text-center text-gray-400">...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {showConfig && (
        <ConfigPanel
          nodeId={data.nodeId}
          nodeType={data.componentId}
          nodeData={data}
          onSave={(nodeId, newData) => {
            data.onConfigSave?.(nodeId, newData);
            setShowConfig(false);
          }}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const EnhancedFlowBuilder: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Create default flow template (handleNodeConfigSave will be defined later)
  const createDefaultFlow = (configSaveHandler: any) => {
    const chatInputNode: Node = {
      id: 'chat_input_1',
      type: 'custom',
      position: { x: 100, y: 200 },
      data: {
        nodeId: 'chat_input_1',
        componentId: 'chat-input',
        label: 'Chat Input',
        description: 'Chat message input',
        category: 'I/O',
        color: '#3b82f6',
        inputs: [],
        outputs: [{ name: 'message', type: 'Message' }],
        config: {},
        onConfigSave: configSaveHandler,
      },
    };

    const llmNode: Node = {
      id: 'openai_llm_1',
      type: 'custom',
      position: { x: 400, y: 200 },
      data: {
        nodeId: 'openai_llm_1',
        componentId: 'openai-llm',
        label: 'OpenAI',
        description: 'OpenAI language model',
        category: 'Models',
        color: '#8b5cf6',
        inputs: [{ name: 'prompt', type: 'Text' }],
        outputs: [{ name: 'response', type: 'Text' }],
        config: {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
        },
        onConfigSave: handleNodeConfigSave,
      },
    };

    const chatOutputNode: Node = {
      id: 'chat_output_1',
      type: 'custom',
      position: { x: 700, y: 200 },
      data: {
        nodeId: 'chat_output_1',
        componentId: 'chat-output',
        label: 'Chat Output',
        description: 'Display chat response',
        category: 'I/O',
        color: '#3b82f6',
        inputs: [{ name: 'message', type: 'Message' }],
        outputs: [],
        config: {},
        onConfigSave: configSaveHandler,
      },
    };

    const defaultEdges: Edge[] = [
      {
        id: 'e1-2',
        source: 'chat_input_1',
        target: 'openai_llm_1',
        sourceHandle: 'message',
        targetHandle: 'prompt',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: 'openai_llm_1',
        target: 'chat_output_1',
        sourceHandle: 'response',
        targetHandle: 'message',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      },
    ];

    return { nodes: [chatInputNode, llmNode, chatOutputNode], edges: defaultEdges };
  };

  // Initialize state first
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState('My Flow');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const { project } = useReactFlow();
  
  // Define handleNodeConfigSave after state is initialized
  const handleNodeConfigSave = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: newData,
          };
        }
        return node;
      })
    );
  }, [setNodes]);
  
  // Set default flow after everything is initialized
  useEffect(() => {
    const defaultFlow = createDefaultFlow(handleNodeConfigSave);
    setNodes(defaultFlow.nodes);
    setEdges(defaultFlow.edges);
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Validate connection based on port types
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode) {
        const sourceOutput = sourceNode.data.outputs?.find((o: any) => o.name === params.sourceHandle);
        const targetInput = targetNode.data.inputs?.find((i: any) => i.name === params.targetHandle);
        
        // Simple type validation (can be enhanced)
        if (sourceOutput && targetInput && sourceOutput.type === targetInput.type) {
          setEdges((eds) => addEdge(params, eds));
        } else {
          toast.error('Incompatible port types');
        }
      }
    },
    [setEdges, nodes]
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

      const nodeId = `${componentData.id}_${Date.now()}`;
      const newNode: Node = {
        id: nodeId,
        type: 'custom',
        position,
        data: { 
          nodeId,
          componentId: componentData.id,
          label: componentData.name,
          description: componentData.description,
          category: componentData.category,
          color: componentData.color,
          inputs: componentData.inputs,
          outputs: componentData.outputs,
          config: {},
          onConfigSave: handleNodeConfigSave,
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
      toast.success(`Flow saved with ID: ${response.data.id}`);
    } catch (error) {
      console.error('Failed to save flow:', error);
      toast.error('Failed to save flow');
    }
  };

  const executeFlow = async () => {
    setIsExecuting(true);
    setShowResults(true);
    setExecutionResults(null);

    // First save the flow
    const flowData = {
      name: flowName,
      data: { nodes, edges },
    };

    try {
      const saveResponse = await axios.post('/api/v1/flows', flowData);
      const flowId = saveResponse.data.id;

      // Execute the flow
      const executeResponse = await axios.post(`/api/v1/flows/${flowId}/run`, {
        inputs: {},
        context: {},
      });

      setExecutionResults(executeResponse.data);
      toast.success('Flow executed successfully');
    } catch (error: any) {
      console.error('Failed to execute flow:', error);
      toast.error(error.response?.data?.detail || 'Failed to execute flow');
      setExecutionResults({ error: error.response?.data?.detail || 'Execution failed' });
    } finally {
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
      {/* Professional Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">AI Agent Builder</h1>
            </div>
            <div className="relative">
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                placeholder="Enter flow name..."
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={saveFlow}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            
            <button
              onClick={executeFlow}
              disabled={isExecuting}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Run</span>
            </button>

            <div className="border-l border-gray-300 h-6 mx-2" />
            
            <button
              onClick={exportFlow}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export Flow"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <label className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors" title="Import Flow">
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept=".json"
                onChange={importFlow}
                className="hidden"
              />
            </label>
            
            <button
              onClick={() => setShowVariables(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Variables"
            >
              <Key className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <div className="border-l border-gray-300 h-6 mx-2" />

            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Dark Mode"
            >
              <Moon className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
              }}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-3">Components</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search components..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {/* Group components by category */}
            {Object.entries(
              componentLibrary.reduce((acc, comp) => {
                if (!acc[comp.category]) acc[comp.category] = [];
                acc[comp.category].push(comp);
                return acc;
              }, {} as Record<string, typeof componentLibrary>)
            ).map(([category, components]) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
                <div className="space-y-2">
                  {components.map((component) => (
                    <div
                      key={component.id}
                      className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md hover:border-indigo-300 transition-all"
                      draggable
                      onDragStart={(event) => onDragStart(event, component)}
                    >
                      <div className="flex items-center">
                        <div 
                          className="p-2 rounded-lg mr-3"
                          style={{ backgroundColor: component.color + '20' }}
                        >
                          {getIcon(category)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">{component.name}</div>
                          <div className="text-xs text-gray-500">{component.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 flex bg-gradient-to-br from-gray-50 to-gray-100">
          <div className={`${showResults ? 'w-2/3' : 'w-full'} transition-all`} ref={reactFlowWrapper}>
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
              connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
              defaultEdgeOptions={{ 
                style: { stroke: '#6366f1', strokeWidth: 2 },
                animated: true 
              }}
            >
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1} 
                color="#e5e7eb"
              />
              <Controls className="bg-white shadow-lg border border-gray-200" />
              <MiniMap 
                className="bg-white shadow-lg border border-gray-200"
                nodeColor={(node) => node.data?.color || '#6366f1'}
              />
              <Panel position="top-left" className="m-4">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Port Types
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(portColors).map(([type, color]) => (
                      <div key={type} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-700">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </div>

          {/* Results Panel */}
          {showResults && (
            <div className="w-1/3 bg-gray-50 border-l p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Execution Results</h3>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isExecuting && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {executionResults && !isExecuting && (
                <div className="space-y-4">
                  {executionResults.error ? (
                    <div className="p-4 bg-red-100 border border-red-400 rounded-md">
                      <p className="text-red-700 font-medium">Error</p>
                      <p className="text-red-600 text-sm mt-1">{executionResults.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-green-100 border border-green-400 rounded-md">
                        <p className="text-green-700 font-medium">Success</p>
                        <p className="text-green-600 text-sm mt-1">Flow executed successfully</p>
                      </div>
                      
                      {Object.entries(executionResults).map(([nodeId, result]: [string, any]) => (
                        <div key={nodeId} className="p-4 bg-white rounded-md shadow">
                          <p className="font-medium text-sm text-gray-700 mb-2">{nodeId}</p>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Variables Panel */}
      <VariablesPanel 
        isOpen={showVariables} 
        onClose={() => setShowVariables(false)} 
      />
    </div>
  );
};

const EnhancedFlowBuilderWithProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <EnhancedFlowBuilder />
    </ReactFlowProvider>
  );
};

export default EnhancedFlowBuilderWithProvider;
