import React from 'react';
import { ComponentType } from '../types/component';
import * as LucideIcons from 'lucide-react';

interface ComponentCardProps {
  component: ComponentType;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Get the icon component dynamically
  const Icon = (LucideIcons as any)[component.icon] || LucideIcons.Box;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {component.display_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {component.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;
