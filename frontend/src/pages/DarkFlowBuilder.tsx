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
  Trash2, HelpCircle, Zap, Plus, Home, FolderOpen,
  Package, Layers, Bot, Sparkles, Code, Terminal
} from 'lucide-react';
import axios from 'axios';
import LangFlowNode from '../components/LangFlowNode';
import toast from 'react-hot-toast';

// Professional dark theme colors
const darkTheme = {
  bg: '#0a0e1a',
  sidebar: '#0f1629',
  card: '#1a2332',
  border: '#2a3441',
  text: '#e8eaed',
  textMuted: '#94a3b8',
  primary: '#3b82f6',      // Professional blue
  secondary: '#0ea5e9',    // Sky blue
  accent: '#14b8a6',       // Teal
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

// Category configurations with icons
const categoryConfig: Record<string, { icon: any; color: string }> = {
  'Input / Output': { icon: Terminal, color: '#3b82f6' },
  'Agents': { icon: Bot, color: '#8b5cf6' },
  'Models': { icon: Brain, color: '#ec4899' },
  'Data': { icon: Database, color: '#06b6d4' },
  'Vector Stores': { icon: Layers, color: '#a855f7' },
  'Processing': { icon: Cpu, color: '#f59e0b' },
  'Logic': { icon: GitBranch, color: '#10b981' },
  'Helpers': { icon: Sparkles, color: '#ef4444' },
  'Bundles': { icon: Package, color: '#6366f1' },
};

// Enhanced component library
const componentLibrary = [
  // Input/Output
  {
    id: 'chat-input',
    name: 'Chat Input',
    category: 'Input / Output',
    description: 'Get chat inputs from the Playground',
    fields: [
      { name: 'Input Text', type: 'text', required: true },
    ],
    outputs: [
      { name: 'Message', type: 'Message' },
    ],
  },
  {
    id: 'chat-output',
    name: 'Chat Output',
    category: 'Input / Output',
    description: 'Display a chat message in the Playground',
    inputs: [
      { name: 'Message', type: 'Message' },
    ],
    outputs: [],
  },
  {
    id: 'text-input',
    name: 'Text Input',
    category: 'Input / Output',
    description: 'Get text inputs from the user',
    fields: [
      { name: 'Value', type: 'text' },
    ],
    outputs: [
      { name: 'Text', type: 'Text' },
    ],
  },
  {
    id: 'text-output',
    name: 'Text Output',
    category: 'Input / Output',
    description: 'Display text output',
    inputs: [
      { name: 'Text', type: 'Text' },
    ],
    outputs: [],
  },
  {
    id: 'prompt',
    name: 'Prompt',
    category: 'Input / Output',
    description: 'Create a prompt template with dynamic variables',
    fields: [
      { name: 'Template', type: 'textarea', required: true },
    ],
    outputs: [
      { name: 'Prompt', type: 'Text' },
    ],
  },
  {
    id: 'file',
    name: 'File',
    category: 'Input / Output',
    description: 'Load a file',
    fields: [
      { name: 'Path', type: 'text' },
    ],
    outputs: [
      { name: 'Data', type: 'Data' },
    ],
  },
  
  // Agents
  {
    id: 'agent',
    name: 'Agent',
    category: 'Agents',
    description: 'Build a Langchain Agent',
    inputs: [
      { name: 'Tools', type: 'Tool' },
      { name: 'LLM', type: 'LanguageModel' },
    ],
    fields: [
      { name: 'Agent Type', type: 'select', options: ['zero-shot-react-description', 'react-docstore', 'self-ask-with-search'], value: 'zero-shot-react-description' },
    ],
    outputs: [
      { name: 'Agent', type: 'Agent' },
    ],
  },
  {
    id: 'csv-agent',
    name: 'CSV Agent',
    category: 'Agents',
    description: 'Construct a CSV agent from a CSV file and tools',
    inputs: [
      { name: 'LLM', type: 'LanguageModel' },
      { name: 'Path', type: 'Text' },
    ],
    outputs: [
      { name: 'Agent', type: 'Agent' },
    ],
  },
  {
    id: 'sql-agent',
    name: 'SQL Agent',
    category: 'Agents',
    description: 'Construct a SQL agent from a database',
    inputs: [
      { name: 'LLM', type: 'LanguageModel' },
      { name: 'Database', type: 'Text' },
    ],
    outputs: [
      { name: 'Agent', type: 'Agent' },
    ],
  },
  
  // Models
  {
    id: 'llama',
    name: 'Llama',
    category: 'Models',
    description: 'Meta Llama language models',
    inputs: [
      { name: 'Input', type: 'Text' },
    ],
    fields: [
      { name: 'Model Name', type: 'select', options: ['llama-2-70b', 'llama-2-13b', 'llama-2-7b', 'code-llama-34b'], value: 'llama-2-13b' },
      { name: 'Temperature', type: 'number', value: 0.7 },
      { name: 'Max Tokens', type: 'number', value: 512 },
    ],
    outputs: [
      { name: 'Text', type: 'Text' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'Models',
    description: 'Anthropic language models',
    inputs: [
      { name: 'Input', type: 'Text' },
    ],
    fields: [
      { name: 'Model', type: 'select', options: ['claude-3-opus', 'claude-3-sonnet', 'claude-2.1'], value: 'claude-3-sonnet' },
      { name: 'API Key', type: 'password' },
    ],
    outputs: [
      { name: 'Text', type: 'Text' },
    ],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    category: 'Models',
    description: 'Cohere language models',
    inputs: [
      { name: 'Input', type: 'Text' },
    ],
    fields: [
      { name: 'Model', type: 'select', options: ['command', 'command-light'], value: 'command' },
      { name: 'API Key', type: 'password' },
    ],
    outputs: [
      { name: 'Text', type: 'Text' },
    ],
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    category: 'Models',
    description: 'HuggingFace language models',
    inputs: [
      { name: 'Input', type: 'Text' },
    ],
    fields: [
      { name: 'Model ID', type: 'text' },
      { name: 'API Token', type: 'password' },
    ],
    outputs: [
      { name: 'Text', type: 'Text' },
    ],
  },
  
  // Data
  {
    id: 'api-request',
    name: 'API Request',
    category: 'Data',
    description: 'Make HTTP requests to APIs',
    inputs: [
      { name: 'URL', type: 'Text' },
    ],
    fields: [
      { name: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], value: 'GET' },
      { name: 'Headers', type: 'textarea' },
    ],
    outputs: [
      { name: 'Response', type: 'Data' },
    ],
  },
  {
    id: 'csv-loader',
    name: 'CSV Loader',
    category: 'Data',
    description: 'Load data from CSV files',
    fields: [
      { name: 'File Path', type: 'text' },
    ],
    outputs: [
      { name: 'Data', type: 'Data' },
    ],
  },
  {
    id: 'json-loader',
    name: 'JSON Loader',
    category: 'Data',
    description: 'Load data from JSON files',
    fields: [
      { name: 'File Path', type: 'text' },
    ],
    outputs: [
      { name: 'Data', type: 'Data' },
    ],
  },
  {
    id: 'web-scraper',
    name: 'Web Scraper',
    category: 'Data',
    description: 'Extract data from websites',
    inputs: [
      { name: 'URL', type: 'Text' },
    ],
    fields: [
      { name: 'CSS Selector', type: 'text' },
    ],
    outputs: [
      { name: 'Data', type: 'Data' },
    ],
  },
  
  // Vector Stores
  {
    id: 'chroma',
    name: 'Chroma',
    category: 'Vector Stores',
    description: 'Chroma vector database',
    inputs: [
      { name: 'Documents', type: 'Document' },
      { name: 'Embeddings', type: 'Embeddings' },
    ],
    fields: [
      { name: 'Collection Name', type: 'text' },
    ],
    outputs: [
      { name: 'Vector Store', type: 'VectorStore' },
    ],
  },
  {
    id: 'pinecone',
    name: 'Pinecone',
    category: 'Vector Stores',
    description: 'Pinecone vector database',
    inputs: [
      { name: 'Documents', type: 'Document' },
      { name: 'Embeddings', type: 'Embeddings' },
    ],
    fields: [
      { name: 'API Key', type: 'password' },
      { name: 'Index Name', type: 'text' },
    ],
    outputs: [
      { name: 'Vector Store', type: 'VectorStore' },
    ],
  },
  {
    id: 'weaviate',
    name: 'Weaviate',
    category: 'Vector Stores',
    description: 'Weaviate vector database',
    inputs: [
      { name: 'Documents', type: 'Document' },
      { name: 'Embeddings', type: 'Embeddings' },
    ],
    fields: [
      { name: 'URL', type: 'text' },
      { name: 'API Key', type: 'password' },
    ],
    outputs: [
      { name: 'Vector Store', type: 'VectorStore' },
    ],
  },
  
  // Processing
  {
    id: 'text-splitter',
    name: 'Text Splitter',
    category: 'Processing',
    description: 'Split text into chunks',
    inputs: [
      { name: 'Text', type: 'Text' },
    ],
    fields: [
      { name: 'Chunk Size', type: 'number', value: 1000 },
      { name: 'Chunk Overlap', type: 'number', value: 200 },
    ],
    outputs: [
      { name: 'Documents', type: 'Document' },
    ],
  },
  {
    id: 'embeddings',
    name: 'Embeddings',
    category: 'Processing',
    description: 'Generate embeddings from text',
    inputs: [
      { name: 'Text', type: 'Text' },
    ],
    fields: [
      { name: 'Model', type: 'select', options: ['openai', 'cohere', 'huggingface'], value: 'openai' },
    ],
    outputs: [
      { name: 'Embeddings', type: 'Embeddings' },
    ],
  },
  {
    id: 'summarizer',
    name: 'Summarizer',
    category: 'Processing',
    description: 'Summarize long texts',
    inputs: [
      { name: 'Text', type: 'Text' },
      { name: 'LLM', type: 'LanguageModel' },
    ],
    outputs: [
      { name: 'Summary', type: 'Text' },
    ],
  },
  
  // Logic
  {
    id: 'conditional',
    name: 'Conditional',
    category: 'Logic',
    description: 'Execute based on condition',
    inputs: [
      { name: 'Condition', type: 'Boolean' },
      { name: 'If True', type: 'Any' },
      { name: 'If False', type: 'Any' },
    ],
    outputs: [
      { name: 'Result', type: 'Any' },
    ],
  },
  {
    id: 'loop',
    name: 'Loop',
    category: 'Logic',
    description: 'Iterate over items',
    inputs: [
      { name: 'Items', type: 'Array' },
    ],
    outputs: [
      { name: 'Item', type: 'Any' },
    ],
  },
  
  // Helpers
  {
    id: 'calculator',
    name: 'Calculator',
    category: 'Helpers',
    description: 'Perform mathematical calculations',
    inputs: [
      { name: 'Expression', type: 'Text' },
    ],
    outputs: [
      { name: 'Result', type: 'Number' },
    ],
  },
  {
    id: 'search',
    name: 'Search',
    category: 'Helpers',
    description: 'Search the web',
    inputs: [
      { name: 'Query', type: 'Text' },
    ],
    fields: [
      { name: 'API Key', type: 'password' },
    ],
    outputs: [
      { name: 'Results', type: 'Text' },
    ],
  },
  
  // Bundles
  {
    id: 'rag-bundle',
    name: 'RAG Bundle',
    category: 'Bundles',
    description: 'Complete RAG pipeline bundle',
    inputs: [
      { name: 'Documents', type: 'Document' },
      { name: 'Query', type: 'Text' },
    ],
    outputs: [
      { name: 'Answer', type: 'Text' },
    ],
  },
  {
    id: 'qa-bundle',
    name: 'Q&A Bundle',
    category: 'Bundles',
    description: 'Question answering bundle',
    inputs: [
      { name: 'Context', type: 'Text' },
      { name: 'Question', type: 'Text' },
    ],
    outputs: [
      { name: 'Answer', type: 'Text' },
    ],
  },
];

const nodeTypes = {
  langflow: LangFlowNode,
};

const DarkFlowBuilder: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(categoryConfig))
  );
  
  // Create default flow
  const createDefaultFlow = (fieldChangeHandler: (nodeId: string, field: string, value: any) => void) => {
    const chatInputNode: Node = {
      id: 'chat_input_1',
      type: 'langflow',
      position: { x: 100, y: 200 },
      data: {
        label: 'Chat Input',
        description: 'Get chat inputs from the Playground',
        icon: <Terminal className="w-4 h-4 text-white" />,
        fields: [
          { name: 'Input Text', type: 'text', value: 'Hello' },
        ],
        outputs: [
          { name: 'Chat Message', type: 'Message' },
        ],
        onFieldChange: (field: string, value: any) => {
          console.log('Field changed:', field, value);
        },
      },
    };

    const llmNode: Node = {
      id: 'llama_1',
      type: 'langflow',
      position: { x: 400, y: 200 },
      data: {
        label: 'Llama Model',
        description: 'Meta Llama language model',
        icon: <Brain className="w-4 h-4 text-white" />,
        inputs: [
          { name: 'Input', type: 'Text' },
          { name: 'System Message', type: 'Text' },
        ],
        fields: [
          { name: 'Model Name', type: 'select', options: ['llama-2-70b', 'llama-2-13b', 'llama-2-7b'], value: 'llama-2-13b' },
          { name: 'Temperature', type: 'number', value: 0.7 },
          { name: 'Max Tokens', type: 'number', value: 512 },
        ],
        outputs: [
          { name: 'Model Response', type: 'Text' },
        ],
        canAddInputs: true,
        maxInputs: 10,
        canAddOutputs: true,
        maxOutputs: 10,
        onFieldChange: (field: string, value: any) => {
          fieldChangeHandler('llama_1', field, value);
        },
        onAddInput: () => {
          console.log('Add input handler needed');
        },
        onRemoveInput: (index: number) => {
          console.log('Remove input handler needed', index);
        },
        onAddOutput: () => {
          console.log('Add output handler needed');
        },
        onRemoveOutput: (index: number) => {
          console.log('Remove output handler needed', index);
        },
      },
    };

    const chatOutputNode: Node = {
      id: 'chat_output_1',
      type: 'langflow',
      position: { x: 700, y: 200 },
      data: {
        label: 'Chat Output',
        description: 'Display a chat message in the Playground',
        icon: <Terminal className="w-4 h-4 text-white" />,
        inputs: [
          { name: 'Inputs', type: 'Message' },
        ],
        fields: [],
        outputs: [
          { name: 'Output Message', type: 'Message' },
        ],
        onFieldChange: (field: string, value: any) => {
          console.log('Field changed:', field, value);
        },
      },
    };

    const promptNode: Node = {
      id: 'prompt_1',
      type: 'langflow',
      position: { x: 100, y: 400 },
      data: {
        label: 'Prompt',
        description: 'Create a prompt template with dynamic variables',
        icon: <FileText className="w-4 h-4 text-white" />,
        fields: [
          { name: 'Template', type: 'textarea', value: 'Answer the user as if you were a pirate.\nUser: {user_input}\nAnswer:' },
        ],
        outputs: [
          { name: 'Prompt', type: 'Text' },
        ],
        onFieldChange: (field: string, value: any) => {
          fieldChangeHandler('prompt_1', field, value);
        },
      },
    };

    const defaultEdges: Edge[] = [
      {
        id: 'e1-2',
        source: 'chat_input_1',
        target: 'llama_1',
        sourceHandle: 'Chat Message',
        targetHandle: 'Input',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: 'llama_1',
        target: 'chat_output_1',
        sourceHandle: 'Model Response',
        targetHandle: 'Inputs',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e4-2',
        source: 'prompt_1',
        target: 'llama_1',
        sourceHandle: 'Prompt',
        targetHandle: 'System Message',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
    ];

    return { nodes: [chatInputNode, llmNode, chatOutputNode, promptNode], edges: defaultEdges };
  };

  // Initialize state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState('Basic Prompting');
  const { project } = useReactFlow();

  // Handler for adding inputs to a node
  const handleAddInput = (nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const currentInputs = node.data.inputs || [];
          const newInputIndex = currentInputs.length + 1;
          const newInput = { 
            name: `Input ${newInputIndex}`, 
            type: 'Text' 
          };
          
          return {
            ...node,
            data: {
              ...node.data,
              inputs: [...currentInputs, newInput],
            },
          };
        }
        return node;
      })
    );
  };

  // Handler for removing inputs from a node
  const handleRemoveInput = (nodeId: string, index: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const currentInputs = node.data.inputs || [];
          return {
            ...node,
            data: {
              ...node.data,
              inputs: currentInputs.filter((_: any, i: number) => i !== index),
            },
          };
        }
        return node;
      })
    );
  };

  // Handler for adding outputs (agent connections) to a node
  const handleAddOutput = (nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const currentOutputs = node.data.outputs || [];
          const agentOutputs = currentOutputs.filter((o: any) => o.type === 'Agent').length;
          const newAgentIndex = agentOutputs + 1;
          const newOutput = { 
            name: `Agent ${newAgentIndex}`, 
            type: 'Agent' 
          };
          
          return {
            ...node,
            data: {
              ...node.data,
              outputs: [...currentOutputs, newOutput],
            },
          };
        }
        return node;
      })
    );
  };

  // Handler for removing outputs from a node
  const handleRemoveOutput = (nodeId: string, index: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const currentOutputs = node.data.outputs || [];
          return {
            ...node,
            data: {
              ...node.data,
              outputs: currentOutputs.filter((_: any, i: number) => i !== index),
            },
          };
        }
        return node;
      })
    );
  };

  // Set default flow on mount
  useEffect(() => {
    const defaultFlow = createDefaultFlow((nodeId: string, field: string, value: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                fields: node.data.fields?.map((f: any) =>
                  f.name === field ? { ...f, value } : f
                ),
              },
            };
          }
          return node;
        })
      );
    });
    
    // Update the nodes with proper handlers
    const nodesWithHandlers = defaultFlow.nodes.map(node => {
      if (node.id === 'llama_1') {
        return {
          ...node,
          data: {
            ...node.data,
            onAddInput: () => handleAddInput('llama_1'),
            onRemoveInput: (index: number) => handleRemoveInput('llama_1', index),
            onAddOutput: () => handleAddOutput('llama_1'),
            onRemoveOutput: (index: number) => handleRemoveOutput('llama_1', index),
          },
        };
      }
      return node;
    });
    
    setNodes(nodesWithHandlers);
    setEdges(defaultFlow.edges);
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds));
    },
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

      const nodeId = `${componentData.id}_${Date.now()}`;
      const CategoryIcon = categoryConfig[componentData.category]?.icon || Terminal;
      
      const isLlamaNode = componentData.id === 'llama';
      const newNode: Node = {
        id: nodeId,
        type: 'langflow',
        position,
        data: {
          label: componentData.name,
          description: componentData.description,
          icon: categoryConfig[componentData.category]?.icon ? 
            React.createElement(categoryConfig[componentData.category].icon, { className: "w-4 h-4 text-white" }) : 
            null,
          inputs: componentData.inputs || [],
          outputs: componentData.outputs || [],
          fields: componentData.fields || [],
          canAddInputs: isLlamaNode,
          maxInputs: isLlamaNode ? 10 : undefined,
          canAddOutputs: isLlamaNode,
          maxOutputs: isLlamaNode ? 10 : undefined,
          onFieldChange: (field: string, value: any) => {
            console.log('Field changed:', field, value);
          },
          onAddInput: isLlamaNode ? () => handleAddInput(nodeId) : undefined,
          onRemoveInput: isLlamaNode ? (index: number) => handleRemoveInput(nodeId, index) : undefined,
          onAddOutput: isLlamaNode ? () => handleAddOutput(nodeId) : undefined,
          onRemoveOutput: isLlamaNode ? (index: number) => handleRemoveOutput(nodeId, index) : undefined,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes, handleAddInput, handleRemoveInput, handleAddOutput, handleRemoveOutput]
  );

  const onDragStart = (event: React.DragEvent, component: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter components
  const filteredComponents = componentLibrary.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category
  const groupedComponents = filteredComponents.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof componentLibrary>);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: darkTheme.bg }}>
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-6 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">AI Agent Builder</h1>
                <p className="text-xs text-slate-400 mt-0.5">Visual Workflow Designer</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Project:</span>
              <span className="text-sm font-medium text-slate-300">{flowName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Connected</span>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-600/20">
              <Play className="w-4 h-4" />
              <span className="font-medium">Run Flow</span>
            </button>
            <button className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 border border-slate-600 transition-all duration-200">
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64" style={{ backgroundColor: darkTheme.sidebar }}>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              {Object.entries(groupedComponents).map(([category, components]) => {
                const CategoryIcon = categoryConfig[category]?.icon || Sparkles;
                const isExpanded = expandedCategories.has(category);
                
                return (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-4 h-4" />
                        <span className="text-sm">{category}</span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {components.map((comp) => (
                          <div
                            key={comp.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, comp)}
                            className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded cursor-move transition-colors"
                          >
                            {comp.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-purple-400 hover:bg-gray-800 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Custom Component</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
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
            className="bg-dots-pattern"
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#3b82f6', strokeWidth: 2 },
            }}
          >
            {/* Remove Background component to use CSS dotted grid */}
            <Controls 
              className="bg-gray-800 border-gray-700"
              style={{ 
                button: { backgroundColor: '#374151', color: '#e5e7eb' },
              }}
            />
            <MiniMap 
              className="bg-gray-800 border-gray-700"
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.8)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

const DarkFlowBuilderWithProvider: React.FC = () => (
  <ReactFlowProvider>
    <DarkFlowBuilder />
  </ReactFlowProvider>
);

export default DarkFlowBuilderWithProvider;
