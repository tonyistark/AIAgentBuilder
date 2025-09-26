import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NodeConfigPanelProps {
  nodeId: string;
  component: any;
  config: Record<string, any>;
  onSave: (config: Record<string, any>) => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  nodeId,
  component,
  config,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{component.display_name} Configuration</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[60vh]">
          {component.inputs?.map((input: any) => (
            <div key={input.name} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {input.display_name}
                {input.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {input.type === 'Text' && !input.options && (
                <input
                  type="text"
                  value={formData[input.name] || input.default || ''}
                  onChange={(e) => handleChange(input.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={input.description}
                  required={input.required}
                />
              )}
              
              {input.type === 'Text' && input.options && (
                <select
                  value={formData[input.name] || input.default || ''}
                  onChange={(e) => handleChange(input.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={input.required}
                >
                  <option value="">Select {input.display_name}</option>
                  {input.options.map((option: string) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              
              {input.type === 'Number' && (
                <input
                  type="number"
                  value={formData[input.name] || input.default || ''}
                  onChange={(e) => handleChange(input.name, parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={input.description}
                  required={input.required}
                  step="any"
                />
              )}
              
              {input.type === 'Boolean' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${nodeId}-${input.name}`}
                    checked={formData[input.name] || input.default || false}
                    onChange={(e) => handleChange(input.name, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${nodeId}-${input.name}`} className="ml-2 text-sm text-gray-600">
                    {input.description}
                  </label>
                </div>
              )}
              
              {input.type === 'Data' && (
                <textarea
                  value={formData[input.name] || input.default || ''}
                  onChange={(e) => handleChange(input.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={input.description}
                  rows={3}
                  required={input.required}
                />
              )}
              
              {input.description && (
                <p className="mt-1 text-xs text-gray-500">{input.description}</p>
              )}
            </div>
          ))}
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
