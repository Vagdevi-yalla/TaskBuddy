import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import FilterDatePicker from '../common/FilterDatePicker';

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
      <div className="flex items-center justify-between">
        {/* Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Filter by:</span>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-2xl text-sm bg-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
          </select>
          <div className="w-[150px]">
            <FilterDatePicker
              selectedDate={dueDateFilter}
              onChange={setDueDateFilter}
            />
          </div>
          {dueDateFilter && (
            <button
              onClick={() => setDueDateFilter('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-2xl text-sm"
            />
          </div>

          {/* Add Task Button */}
          <button 
            onClick={onAddTask}
            className="bg-[#7B1984] text-white px-6 py-2 rounded-2xl text-sm font-medium hover:bg-opacity-90"
          >
            ADD TASK
          </button>
        </div>
      </div>
    </div>
  );
} 