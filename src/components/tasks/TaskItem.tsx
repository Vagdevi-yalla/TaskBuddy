import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Task } from '../../types/Task';
import { Icons } from '../../assets';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  viewMode: 'list' | 'board';
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
}

export default function TaskItem({
  task,
  viewMode,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  provided,
  snapshot
}: TaskItemProps) {
  if (viewMode === 'list') {
    return (
      <div
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        className={`transition-all duration-200 ${
          snapshot?.isDragging ? 'shadow-lg ring-2 ring-[#7B1984] ring-opacity-50 scale-[1.02]' : ''
        }`}
      >
        {/* Mobile View */}
        <div className="md:hidden bg-white p-3 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {onSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect(task.id)}
                  className="h-4 w-4 rounded border-gray-300 text-[#7B1984] focus:ring-[#7B1984]"
                />
              )}
              <img 
                src={task.status === 'COMPLETED' ? Icons.greenTick : Icons.tick} 
                alt="status" 
                className="w-5 h-5" 
              />
              <h3 className={`font-medium text-gray-900 ${task.status === 'COMPLETED' ? 'line-through' : ''}`}>
                {task.title}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(task)}
                className="text-gray-400 hover:text-[#7B1984]"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-[120px_3fr_1.2fr_1.2fr_1.2fr_100px] gap-4 items-center py-3 px-4 border-b border-gray-300 bg-[#F1F1F1]">
          <div className="flex items-center">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(task.id)}
                className="h-4 w-4 rounded border-gray-300 text-[#7B1984] focus:ring-[#7B1984]"
              />
            )}
            <div
              {...provided?.dragHandleProps}
              className="cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded flex items-center ml-2 h-4"
            >
              <img src={Icons.drag} alt="drag" className="w-4 h-4" />
              <img 
                src={task.status === 'COMPLETED' ? Icons.greenTick : Icons.tick} 
                alt="status" 
                className="w-5 h-5" 
              />
            </div>
          </div>
          <div className={`text-sm text-gray-900 ${task.status === 'COMPLETED' ? 'line-through' : ''} -ml-8`}>
            {task.title}
          </div>
          <div className="text-sm text-gray-500">{new Date(task.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</div>
          <div className="text-sm text-gray-500">{task.status}</div>
          <div className="text-sm text-gray-500">{task.category}</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="text-gray-400 hover:text-[#7B1984]"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-red-600"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`bg-white p-4 rounded-lg shadow-sm mb-4 ${
        snapshot?.isDragging ? 'shadow-lg ring-2 ring-[#7B1984] ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className={`font-medium text-gray-900 ${task.status === 'COMPLETED' ? 'line-through' : ''}`}>
            {task.title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-[#7B1984]"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
          {task.category}
        </span>
        <span className="text-gray-500">
          {new Date(task.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
} 