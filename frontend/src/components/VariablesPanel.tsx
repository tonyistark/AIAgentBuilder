import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Eye, EyeOff, Key, Globe, Folder, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Variable {
  id: string;
  name: string;
  value?: string;
  type: string;
  is_encrypted: boolean;
  description?: string;
  scope: string;
  project_id?: string;
}

interface VariablesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({ isOpen, onClose }) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'global' | 'project' | 'user'>('all');

  const [formData, setFormData] = useState({
    name: '',
    value: '',
    type: 'string',
    is_encrypted: false,
    description: '',
    scope: 'global',
  });

  useEffect(() => {
    if (isOpen) {
      fetchVariables();
    }
  }, [isOpen, filter]);

  const fetchVariables = async () => {
    setLoading(true);
    try {
      const params: any = { include_values: false };
      if (filter !== 'all') {
        params.scope = filter;
      }
      
      const response = await axios.get('/api/v1/variables', { params });
      setVariables(response.data);
    } catch (error) {
      console.error('Failed to fetch variables:', error);
      toast.error('Failed to load variables');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/variables', formData);
      toast.success('Variable created successfully');
      setShowCreateForm(false);
      setFormData({
        name: '',
        value: '',
        type: 'string',
        is_encrypted: false,
        description: '',
        scope: 'global',
      });
      fetchVariables();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create variable');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariable) return;

    try {
      await axios.put(`/api/v1/variables/${editingVariable.id}`, formData);
      toast.success('Variable updated successfully');
      setEditingVariable(null);
      fetchVariables();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update variable');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variable?')) return;

    try {
      await axios.delete(`/api/v1/variables/${id}`);
      toast.success('Variable deleted successfully');
      fetchVariables();
    } catch (error) {
      toast.error('Failed to delete variable');
    }
  };

  const toggleShowValue = async (variable: Variable) => {
    if (showValues[variable.id]) {
      setShowValues(prev => ({ ...prev, [variable.id]: false }));
    } else {
      try {
        const response = await axios.get(`/api/v1/variables/${variable.id}`, {
          params: { include_value: true }
        });
        setVariables(prev => prev.map(v => 
          v.id === variable.id ? { ...v, value: response.data.value } : v
        ));
        setShowValues(prev => ({ ...prev, [variable.id]: true }));
      } catch (error) {
        toast.error('Failed to fetch variable value');
      }
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'global':
        return <Globe className="w-4 h-4" />;
      case 'project':
        return <Folder className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'text-blue-600';
      case 'number':
        return 'text-green-600';
      case 'boolean':
        return 'text-yellow-600';
      case 'secret':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Variables Management</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Filter Tabs */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('global')}
              className={`px-3 py-1 rounded ${filter === 'global' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Global
            </button>
            <button
              onClick={() => setFilter('project')}
              className={`px-3 py-1 rounded ${filter === 'project' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Project
            </button>
            <button
              onClick={() => setFilter('user')}
              className={`px-3 py-1 rounded ${filter === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              User
            </button>
          </div>

          {/* Create Button */}
          {!showCreateForm && !editingVariable && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mb-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Variable</span>
            </button>
          )}

          {/* Create/Edit Form */}
          {(showCreateForm || editingVariable) && (
            <form onSubmit={editingVariable ? handleUpdate : handleCreate} className="mb-6 p-4 bg-gray-50 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="secret">Secret</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type={formData.type === 'secret' ? 'password' : 'text'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="global">Global</option>
                    <option value="project">Project</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_encrypted}
                      onChange={(e) => setFormData({ ...formData, is_encrypted: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Encrypt this variable</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingVariable(null);
                    setFormData({
                      name: '',
                      value: '',
                      type: 'string',
                      is_encrypted: false,
                      description: '',
                      scope: 'global',
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingVariable ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          )}

          {/* Variables List */}
          <div className="overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading variables...</div>
            ) : variables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No variables found</div>
            ) : (
              <div className="space-y-2">
                {variables.map((variable) => (
                  <div key={variable.id} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getScopeIcon(variable.scope)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{variable.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getTypeColor(variable.type)}`}>
                              {variable.type}
                            </span>
                            {variable.is_encrypted && (
                              <Key className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          {variable.description && (
                            <p className="text-sm text-gray-600 mt-1">{variable.description}</p>
                          )}
                          {showValues[variable.id] && variable.value && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono">
                              {variable.value}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleShowValue(variable)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title={showValues[variable.id] ? 'Hide value' : 'Show value'}
                        >
                          {showValues[variable.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingVariable(variable);
                            setFormData({
                              name: variable.name,
                              value: '',
                              type: variable.type,
                              is_encrypted: variable.is_encrypted,
                              description: variable.description || '',
                              scope: variable.scope,
                            });
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variable.id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariablesPanel;
