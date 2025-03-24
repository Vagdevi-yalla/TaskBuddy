import { useState } from 'react';
import { TaskStatus } from '../../types/Task';

interface MultiSelectActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onStatusUpdate: (status: TaskStatus) => void;
  onDelete: () => void;
}

export default function MultiSelectActionsBar({
  selectedCount,
  onClearSelection,
  onStatusUpdate,
  onDelete
}: MultiSelectActionsBarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (selectedCount === 0) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black text-white rounded-lg shadow-lg flex items-center gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {selectedCount} Tasks Selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-gray-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm">Status</span>
        </button>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-400 text-sm px-3 py-1.5"
        >
          Delete
        </button>
      </div>
      {showStatusMenu && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-black rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                onStatusUpdate('TO-DO');
                setShowStatusMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-50"
            >
              To Do
            </button>
            <button
              onClick={() => {
                onStatusUpdate('IN-PROGRESS');
                setShowStatusMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-50"
            >
              In Progress
            </button>
            <button
              onClick={() => {
                onStatusUpdate('COMPLETED');
                setShowStatusMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-50"
            >
              Completed
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 