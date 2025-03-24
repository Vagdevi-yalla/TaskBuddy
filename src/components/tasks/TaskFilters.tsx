import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import RelativeDatePicker from '../common/RelativeDatePicker';

interface TaskFiltersProps {
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  dueDateFilter: string;
  setDueDateFilter: (date: string) => void;
  search: string;
  setSearch: (search: string) => void;
  onAddTask: () => void;
}

export default function TaskFilters({
  categoryFilter,
  setCategoryFilter,
  dueDateFilter,
  setDueDateFilter,
  search,
  setSearch,
  onAddTask
}: TaskFiltersProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-6">
      {/* Mobile Add Task Button - Positioned at top */}
      <div className="flex md:hidden justify-end mb-4">
        <button 
          onClick={onAddTask}
          className="bg-[#7B1984] text-white px-6 py-2 rounded-2xl text-sm font-medium hover:bg-opacity-90"
        >
          ADD TASK
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Filters */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:items-center md:space-x-2">
          <span className="text-xs md:text-sm text-gray-500">Filter by:</span>
          <div className="flex space-x-2">
            <select 
              className="flex-1 md:flex-none px-3 py-1 md:px-4 md:py-2 border border-gray-300 rounded-2xl text-xs md:text-sm bg-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Category</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </select>
            <div className="flex-1 md:w-[150px]">
              <RelativeDatePicker
                selectedDate={dueDateFilter}
                onChange={setDueDateFilter}
                placeholder="Due Date"
              />
            </div>
          </div>
        </div>

        {/* Search and Desktop Add Task Button */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:flex-none">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-2xl text-sm"
            />
          </div>

          {/* Desktop Add Task Button */}
          <button 
            onClick={onAddTask}
            className="hidden md:block bg-[#7B1984] text-white px-6 py-2 rounded-2xl text-sm font-medium hover:bg-opacity-90"
          >
            ADD TASK
          </button>
        </div>
      </div>
    </div>
  );
} 