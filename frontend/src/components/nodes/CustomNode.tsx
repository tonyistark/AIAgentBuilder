import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Settings } from 'lucide-react';
import NodeConfigPanel from './NodeConfigPanel';

interface CustomNodeData {
  label: string;
  description: string;
  color: string;
  component: any;
  config: Record<string, any>;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, id, selected }) => {
  const [showConfig, setShowConfig] = useState(false);

  const handleConfigSave = (newConfig: Record<string, any>) => {
    // Update node data with new configuration
    data.config = newConfig;
    setShowConfig(false);
  };

  return (
    <>
      <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-400'}`}>
        <div className="flex items-center justify-between">
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
          <button
            onClick={() => setShowConfig(true)}
            className="ml-2 p-1 hover:bg-gray-100 rounded"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Input handles */}
        {data.component?.inputs?.map((input: any, index: number) => (
          <Handle
            key={`input-${input.name}`}
            type="target"
            position={Position.Left}
            id={input.name}
            style={{ 
              top: `${50 + index * 20}%`,
              background: getPortColor(input.type)
            }}
            className="w-3 h-3 border-2 border-white"
          />
        ))}
        
        {/* Output handles */}
        {data.component?.outputs?.map((output: any, index: number) => (
          <Handle
            key={`output-${output.name}`}
            type="source"
            position={Position.Right}
            id={output.name}
            style={{ 
              top: `${50 + index * 20}%`,
              background: getPortColor(output.type)
            }}
            className="w-3 h-3 border-2 border-white"
          />
        ))}
      </div>
      
      {/* Configuration Panel */}
      {showConfig && (
        <NodeConfigPanel
          nodeId={id}
          component={data.component}
          config={data.config || {}}
          onSave={handleConfigSave}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  );
};

// Get color for port based on data type
function getPortColor(type: string): string {
  const colors: Record<string, string> = {
    Text: '#3b82f6',
    Number: '#10b981',
    Boolean: '#f59e0b',
    Data: '#ef4444',
    DataFrame: '#ec4899',
    Embeddings: '#10b981',
    LanguageModel: '#8b5cf6',
    Memory: '#f97316',
    Message: '#6366f1',
    Tool: '#06b6d4',
    VectorStore: '#a855f7',
    Any: '#6b7280',
  };
  return colors[type] || colors.Any;
}

export default CustomNode;
