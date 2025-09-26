import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import * as LucideIcons from 'lucide-react';
import { ComponentType, PortType } from '../types/component';
import { cn } from '../lib/utils';

const portColors: Record<string, string> = {
  Text: 'bg-blue-500',
  Number: 'bg-green-500',
  Boolean: 'bg-yellow-500',
  Data: 'bg-red-500',
  DataFrame: 'bg-pink-500',
  Embeddings: 'bg-emerald-500',
  LanguageModel: 'bg-fuchsia-500',
  Memory: 'bg-orange-500',
  Message: 'bg-indigo-500',
  Tool: 'bg-cyan-500',
  VectorStore: 'bg-purple-500',
  Any: 'bg-gray-500',
};

interface CustomNodeData {
  label: string;
  component: ComponentType;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const component = data.component;
  const Icon = (LucideIcons as any)[component.icon] || LucideIcons.Box;

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 min-w-[200px]',
        selected ? 'border-indigo-500' : 'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {data.label}
          </h3>
        </div>
      </div>

      <div className="p-4">
        {/* Input ports */}
        <div className="space-y-2 mb-4">
          {component.inputs.map((input, index) => (
            <div key={input.id} className="relative">
              <Handle
                type="target"
                position={Position.Left}
                id={input.name}
                style={{ top: `${20 + index * 30}px` }}
                className={cn(
                  'w-3 h-3 border-2 border-white',
                  portColors[input.type] || portColors.Any
                )}
              />
              <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
                {input.display_name}
                {input.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Output ports */}
        <div className="space-y-2">
          {component.outputs.map((output, index) => (
            <div key={output.id} className="relative text-right">
              <Handle
                type="source"
                position={Position.Right}
                id={output.name}
                style={{ top: `${20 + (component.inputs.length * 30) + 20 + index * 30}px` }}
                className={cn(
                  'w-3 h-3 border-2 border-white',
                  portColors[output.type] || portColors.Any
                )}
              />
              <div className="mr-6 text-xs text-gray-600 dark:text-gray-400">
                {output.display_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(CustomNode);
