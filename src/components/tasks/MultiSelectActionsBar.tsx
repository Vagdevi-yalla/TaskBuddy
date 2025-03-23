import { TrashIcon } from '@heroicons/react/24/outline';
import { COLORS } from '../../constants/colors';

interface MultiSelectActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
}

export const MultiSelectActionsBar = ({ selectedCount, onDelete }: MultiSelectActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'} selected
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onDelete}
          className="flex items-center text-red-600 hover:text-red-700"
        >
          <TrashIcon className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Delete</span>
        </button>
      </div>
    </div>
  );
}; 