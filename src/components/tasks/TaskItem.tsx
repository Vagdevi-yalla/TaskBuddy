import { useState } from 'react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Task } from '../../types/Task';
import { COLORS } from '../../constants/colors';

interface TaskItemProps {
  task: Task;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onSelect: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isSelected: boolean;
}

export const TaskItem = ({ 
  task, 
  provided, 
  snapshot, 
  onSelect, 
  onEdit, 
  onDelete,
  isSelected 
}: TaskItemProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`bg-[${COLORS.background}] border-b border-gray-200 transition-all duration-200 ${
        snapshot.isDragging ? 'shadow-lg ring-2 ring-[#7B1984] ring-opacity-50 scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(task.id)}
          className="h-4 w-4 rounded border-gray-300 text-[#7B1984] focus:ring-[#7B1984] ml-4"
        />
        <div
          {...provided.dragHandleProps}
          className="cursor-grab active:cursor-grabbing ml-2"
        >
          <img 
            src="/src/assets/images/drag_icon.png" 
            alt="Drag" 
            className="w-4 h-4"
          />
        </div>
        <div className="ml-3 flex-grow grid grid-cols-4 gap-4 items-center">
          <div className="flex items-center">
            <span className="text-sm font-medium">{task.title}</span>
          </div>
          <div className="flex items-center justify-start">
            <span className="text-sm text-gray-500">{task.dueDate}</span>
          </div>
          <div className="flex items-center justify-start">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'TO-DO' ? 'bg-gray-100 text-gray-800' :
              task.status === 'IN-PROGRESS' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {task.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
              {task.category}
            </span>
            <div className="relative ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8C3 8.55228 2.55228 9 2 9C1.44772 9 1 8.55228 1 8C1 7.44772 1.44772 7 2 7C2.55228 7 3 7.44772 3 8Z" fill="#6B7280"/>
                  <path d="M9 8C9 8.55228 8.55228 9 8 9C7.44772 9 7 8.55228 7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8Z" fill="#6B7280"/>
                  <path d="M15 8C15 8.55228 14.5523 9 14 9C13.4477 9 13 8.55228 13 8C13 7.44772 13.4477 7 14 7C14.5523 7 15 7.44772 15 8Z" fill="#6B7280"/>
                </svg>
              </button>
              {showActions && (
                <div 
                  className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg py-2 w-32 z-50"
                  onMouseLeave={() => setShowActions(false)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 