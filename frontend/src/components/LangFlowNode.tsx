import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { ChevronDown, ChevronRight, Settings, Copy, Trash2, Plus, X } from 'lucide-react';

interface NodeField {
  name: string;
  type: string;
  value?: any;
  options?: string[];
  required?: boolean;
}
interface LangFlowNodeProps {
  data: {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    inputs?: { name: string; type: string }[];
    outputs?: { name: string; type: string }[];
    fields?: NodeField[];
    onFieldChange?: (fieldName: string, value: any) => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onAddInput?: () => void;
    onRemoveInput?: (index: number) => void;
    canAddInputs?: boolean;
    maxInputs?: number;
    onAddOutput?: () => void;
    onRemoveOutput?: (index: number) => void;
    canAddOutputs?: boolean;
    maxOutputs?: number;
  };
  selected?: boolean;
}

const LangFlowNode: React.FC<LangFlowNodeProps> = ({ data, selected }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['inputs', 'outputs']));
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editingField && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingField]);

  const renderField = (field: NodeField, index: number) => {
    if (field.type === 'select' && field.options) {
      return (
        <div key={field.name} className="group">
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">{field.name}</label>
          <div className="relative">
            <select 
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-200 appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all duration-200 hover:border-slate-500"
              value={field.value || field.options[0]}
              onChange={(e) => data.onFieldChange?.(field.name, e.target.value)}
            >
              {field.options.map(opt => (
                <option key={opt} value={opt} className="bg-gray-800">{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      );
    }

    if (field.type === 'password') {
      return (
        <div key={field.name} className="group">
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">{field.name}</label>
          <input
            type="password"
            className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500"
            placeholder="••••••••••••"
            value={field.value || ''}
            onChange={(e) => data.onFieldChange?.(field.name, e.target.value)}
          />
        </div>
      );
    }

    if (field.type === 'textarea') {
      const isEditing = editingField === field.name;
      
      return (
        <div key={field.name} className="group">
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">{field.name}</label>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              className="w-full bg-slate-900 border-2 border-blue-500 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[150px] resize-y transition-all duration-200"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => {
                data.onFieldChange?.(field.name, tempValue);
                setEditingField(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditingField(null);
                  setTempValue(field.value || '');
                }
              }}
            />
          ) : (
            <div
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 min-h-[100px] cursor-pointer hover:border-slate-500 transition-all duration-200 whitespace-pre-wrap"
              onDoubleClick={() => {
                setEditingField(field.name);
                setTempValue(field.value || '');
              }}
            >
              {field.value || <span className="text-slate-500 italic">Double-click to edit {field.name.toLowerCase()}...</span>}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={field.name} className="group">
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">{field.name}</label>
        <input
          type="text"
          className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500"
          placeholder={`Enter ${field.name}...`}
          value={field.value || ''}
          onChange={(e) => data.onFieldChange?.(field.name, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className={`bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl shadow-2xl min-w-[320px] border border-slate-700/50 ${selected ? 'ring-2 ring-blue-500 shadow-blue-500/25' : ''} transition-all duration-200`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-5 py-4 rounded-t-xl relative overflow-hidden border-b border-slate-600/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg backdrop-blur-sm border border-slate-500/30">
              {data.icon}
            </div>
            <div>
              <h3 className="text-white font-medium text-base tracking-tight">{data.label}</h3>
              {data.description && (
                <p className="text-xs text-slate-300 mt-0.5 opacity-90">{data.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 hover:bg-slate-600/50 rounded-lg transition-all duration-150 group">
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>
            <button className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all duration-150 group">
              <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Input Section - Enhanced Design */}
        {data.inputs && data.inputs.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inputs</h3>
              {data.canAddInputs && data.inputs.length < (data.maxInputs || 10) && (
                <button
                  onClick={() => data.onAddInput?.()}
                  className="p-1 hover:bg-slate-700/50 rounded transition-colors duration-200 group"
                  title="Add input"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.inputs.map((input, idx) => (
                <div key={`${input.name}-${idx}`} className="relative group">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={input.name}
                    className="!w-4 !h-4 !border-2 !border-gray-800 hover:!border-gray-600 !shadow-lg transition-all duration-300 hover:scale-125"
                    style={{
                      left: -20,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #818cf8 100%)',
                      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                    }}
                  />
                  <div className="relative overflow-hidden bg-slate-800/30 border border-slate-600/50 rounded-lg group-hover:border-blue-500/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">{input.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Awaiting input</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-blue-400/70 font-mono">{input.type}</span>
                          {data.canAddInputs && idx >= 2 && (
                            <button
                              onClick={() => data.onRemoveInput?.(idx)}
                              className="p-0.5 hover:bg-red-500/20 rounded transition-colors duration-200 group/remove"
                              title="Remove input"
                            >
                              <X className="w-3 h-3 text-slate-500 group-hover/remove:text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fields Section */}
        {data.fields && data.fields.length > 0 && (
          <div className="mb-4">
            <div className="space-y-2">
              {data.fields.map((field, idx) => renderField(field, idx))}
            </div>
          </div>
        )}

        {/* Output Section - Enhanced Design */}
        {data.outputs && data.outputs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outputs</h3>
              {data.canAddOutputs && data.outputs.length < (data.maxOutputs || 10) && (
                <button
                  onClick={() => data.onAddOutput?.()}
                  className="p-1 hover:bg-slate-700/50 rounded transition-colors duration-200 group"
                  title="Add agent output"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.outputs.map((output, idx) => (
                <div key={`${output.name}-${idx}`} className="relative group">
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={output.name}
                    className="!w-4 !h-4 !border-2 !border-gray-800 hover:!border-gray-600 !shadow-lg transition-all duration-300 hover:scale-125"
                    style={{
                      right: -20,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
                    }}
                  />
                  <div className="relative overflow-hidden bg-slate-800/30 border border-slate-600/50 rounded-lg group-hover:border-cyan-500/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">{output.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {output.type === 'Agent' ? 'Agent connection' : 'Ready to connect'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-cyan-400/70 font-mono">{output.type}</span>
                          {data.canAddOutputs && idx >= 1 && (
                            <button
                              onClick={() => data.onRemoveOutput?.(idx)}
                              className="p-0.5 hover:bg-red-500/20 rounded transition-colors duration-200 group/remove"
                              title="Remove output"
                            >
                              <X className="w-3 h-3 text-slate-500 group-hover/remove:text-red-400" />
                            </button>
                          )}
                          {output.type !== 'Agent' && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                              <ChevronRight className="w-3 h-3 text-cyan-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LangFlowNode;
