import { Icons } from "../../assets/index";

type ViewMode = 'list' | 'board';

interface TaskHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onLogout: () => void;
}

export default function TaskHeader({ viewMode, setViewMode, onLogout }: TaskHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Left side - View Toggle */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-4 py-2 ${
            viewMode === 'list' ? 'border-b-2 border-black' : ''
          }`}
        > <img src={Icons.list} alt="List" className="w-6 h-6" />
          <span>List</span>
        </button>
        <button
          onClick={() => setViewMode('board')}
          className={`flex items-center gap-2 px-4 py-2 ${
            viewMode === 'board' ? 'border-b-2 border-black' : ''
          }`}
        > <img src={Icons.board} alt="Board" className="w-6 h-6" />
          <span>Board</span>
        </button>
      </div>

      {/* Right side - Logout */}
      <button
        onClick={onLogout}
        className="hidden md:flex items-center gap-2 text-black bg-[#FFF9F9] border-2 border-[#7B1984]/15 rounded-lg px-4 py-2"
      > 
        <img src={Icons.logout} alt="Logout" className="w-6 h-6" />
        <span>Logout</span>
      </button>
    </div>
  );
} 