import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { Task } from '../../types/Task';

interface TaskItemProps {
  task: Task;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  viewMode: 'list' | 'board';
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
}

export default function TaskItem({
  task,
  provided,
  snapshot,
  viewMode,
  onEdit,
  onDelete,
  isSelected,
  onSelect
}: TaskItemProps) {
  if (viewMode === 'list') {
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`bg-[#F1F1F1] border-b border-gray-300 transition-all duration-200 mb-4 ${
          snapshot.isDragging ? 'shadow-lg ring-2 ring-[#7B1984] ring-opacity-50 scale-[1.02]' : ''
        }`}
      >
        <div className="flex items-center py-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(task.id)}
              className="h-4 w-4 rounded border-gray-300 text-[#7B1984] focus:ring-[#7B1984] ml-4"
            />
          )}
          <div
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded flex items-center ml-2 h-4"
          >
            <div className="flex gap-[3px] h-3">
              <div className="flex flex-col justify-between h-full">
                <div className="w-[4px] h-[2px] rounded-full bg-gray-400"></div>
                <div className="w-[4px] h-[2px] rounded-full bg-gray-400"></div>
                <div className="w-[4px] h-[2px] rounded-full bg-gray-400"></div>
              </div>
              <div className="flex flex-col justify-between h-full">
                <div className="w-[4px] h-[2px] rounded-full bg-gray-400"></div>
                <div className="w-[4px] h-[2px] rounded-full bg-gray-400"></div>
                <div className="w-[4px] h-[2px] rounded-full bg-gray-400"></div>
              </div>
            </div>
          </div>
          <div className="flex-grow grid grid-cols-4 gap-4 ml-4 mr-6">
            <div className="text-sm text-gray-900">{task.title}</div>
            <div className="text-sm text-gray-500">
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="text-sm text-gray-500">{task.status}</div>
            <div className="text-sm text-gray-500">{task.category}</div>
          </div>
          <div className="flex items-center space-x-2 mr-4">
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
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`bg-[#F1F1F1] p-4 rounded-lg shadow-sm mb-4 ${
        snapshot.isDragging ? 'shadow-lg ring-2 ring-[#7B1984] ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
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