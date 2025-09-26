import React from 'react';
import { Save, Play, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFlowStore } from '../store/flowStore';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { flowName, setFlowName, saveFlow, runFlow } = useFlowStore();

  const handleSave = async () => {
    try {
      await saveFlow();
      toast.success('Flow saved successfully');
    } catch (error) {
      toast.error('Failed to save flow');
    }
  };

  const handleRun = async () => {
    try {
      await runFlow();
      toast.success('Flow execution started');
    } catch (error) {
      toast.error('Failed to run flow');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            LangFlow Clone
          </h1>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Flow name"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          
          <button
            onClick={handleRun}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Play className="w-4 h-4" />
            <span>Run</span>
          </button>
          
          <button className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
