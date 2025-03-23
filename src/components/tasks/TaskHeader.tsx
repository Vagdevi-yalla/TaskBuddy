import { Icons } from "../../assets/index";

type ViewMode = 'list' | 'board';

interface TaskHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onLogout: () => void;
}

export default function TaskHeader({ viewMode, setViewMode, onLogout }: TaskHeaderProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        {/* View Toggle */}
        <div className="flex space-x-6">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-2 py-2 ${
              viewMode === 'list' ? 'border-b-2 border-black' : ''
            }`}
          >
            <img src={Icons.list} alt="List View" className="w-5 h-5 mr-2" />
            <span className="text-sm">List</span>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center px-2 py-2 ${
              viewMode === 'board' ? 'border-b-2 border-black' : ''
            }`}
          >
            <img src={Icons.board} alt="Board View" className="w-5 h-5 mr-2" />
            <span className="text-sm">Board</span>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center px-3 py-2 border border-[#7B1984]/15 rounded-md bg-[#FFF9F9] hover:bg-gray-100 transition-colors duration-200"
        >
          <img src={Icons.logout} alt="Logout" className="w-5 h-5 mr-2" />
          <span className="text-sm text-gray-700 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
} 