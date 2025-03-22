import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { DragDropContext, Draggable, Droppable, DropResult, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserTasks, deleteTask, updateTaskStatus, updateTaskOrders } from '../services/taskService';
import { Task, TaskStatus } from '../types/Task';
import TaskForm from '../components/TaskForm';

type ViewMode = 'list' | 'board';

interface TaskItemProps {
  task: Task;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

export default function Tasks() {
  const { user, signOut } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState({
    todo: true,
    inProgress: true,
    completed: true
  });
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const toggleSection = (section: 'todo' | 'inProgress' | 'completed') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const loadTasks = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping task load');
      return;
    }
    try {
      console.log('Loading tasks for user:', user.uid);
      const fetchedTasks = await fetchUserTasks(user.uid);
      console.log('Tasks loaded:', fetchedTasks);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, [user]);

  // Load tasks whenever user changes
  useEffect(() => {
    if (user) {
      console.log('User changed, loading tasks');
      loadTasks();
    } else {
      console.log('No user, clearing tasks');
      setTasks([]); // Clear tasks when user is not signed in
    }
  }, [user, loadTasks]);

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowAddTask(true);
  };

  const handleTaskAdded = async () => {
    console.log('Task added, refreshing task list');
    setEditingTask(null);
    await loadTasks();
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(taskId)) {
        newSelected.delete(taskId);
      } else {
        newSelected.add(taskId);
      }
      return newSelected;
    });
  };

  const handleMultipleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.size} tasks?`)) return;
    try {
      for (const taskId of selectedTasks) {
        await deleteTask(taskId);
      }
      setSelectedTasks(new Set());
      await loadTasks();
    } catch (error) {
      console.error('Error deleting multiple tasks:', error);
    }
  };

  const handleMultipleStatusUpdate = async (status: TaskStatus) => {
    try {
      for (const taskId of selectedTasks) {
        await updateTaskStatus(taskId, status);
      }
      setSelectedTasks(new Set());
      await loadTasks();
    } catch (error) {
      console.error('Error updating multiple tasks:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination
    if (!destination) {
      return;
    }

    // Don't do anything if dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Create a new array of tasks
    const newTasks = Array.from(tasks);
    
    // Find all tasks in the source status
    const sourceTasks = newTasks.filter(t => t.status === source.droppableId);
    // Find all tasks in the destination status
    const destTasks = destination.droppableId === source.droppableId
      ? sourceTasks
      : newTasks.filter(t => t.status === destination.droppableId);

    // Remove the task from its current position
    sourceTasks.splice(source.index, 1);

    // Update task status if moving between columns
    if (destination.droppableId !== source.droppableId) {
      task.status = destination.droppableId as TaskStatus;
    }

    // Insert the task at its new position
    destTasks.splice(destination.index, 0, task);

    // Update the state immediately for smooth UI
    setTasks(newTasks);

    // Update the database
    try {
      if (destination.droppableId !== source.droppableId) {
        await updateTaskStatus(draggableId, destination.droppableId as TaskStatus);
      }
      // Update the order of tasks in both source and destination lists
      const tasksToUpdate = destination.droppableId === source.droppableId
        ? sourceTasks
        : [...sourceTasks, ...destTasks];
      await updateTaskOrders(tasksToUpdate);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert to original state if there's an error
      await loadTasks();
    }
  };

  // Update the isWithinDateRange function to handle specific date
  const isWithinDateRange = (taskDate: string, filterDate: string) => {
    if (!taskDate || !filterDate) return true;
    
    const dueDate = new Date(taskDate);
    const selectedDate = new Date(filterDate);
    
    // Compare year, month, and day only
    return dueDate.getFullYear() === selectedDate.getFullYear() &&
           dueDate.getMonth() === selectedDate.getMonth() &&
           dueDate.getDate() === selectedDate.getDate();
  };

  // Update the filterTasks function
  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        task.category.toLowerCase().includes(searchLower) ||
        task.status.toLowerCase().includes(searchLower);

      const matchesCategory = categoryFilter === 'all' || task.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesDueDate = isWithinDateRange(task.dueDate, dueDateFilter);

      return matchesSearch && matchesCategory && matchesDueDate;
    });
  };

  const todoTasks = filterTasks(tasks.filter(task => task.status === 'TO-DO'));
  const inProgressTasks = filterTasks(tasks.filter(task => task.status === 'IN-PROGRESS'));
  const completedTasks = filterTasks(tasks.filter(task => task.status === 'COMPLETED'));

  const TaskItem = ({ task, provided, snapshot }: TaskItemProps) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`bg-gray-50 border-b border-gray-200 transition-all duration-200 ${
        snapshot.isDragging ? 'shadow-lg ring-2 ring-[#7B1984] ring-opacity-50 scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center py-3">
        <input
          type="checkbox"
          checked={selectedTasks.has(task.id)}
          onChange={() => handleSelectTask(task.id)}
          className="h-4 w-4 rounded border-gray-300 text-[#7B1984] focus:ring-[#7B1984] ml-4"
        />
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditTask(task)}
                className="text-gray-400 hover:text-[#7B1984] p-1"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-gray-400 hover:text-red-600 p-1"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Update the Droppable sections
  const DroppableSection = ({ 
    id, 
    title, 
    tasks, 
    isOpen, 
    onToggle, 
    bgColor, 
    iconColor,
    count 
  }: {
    id: TaskStatus;
    title: string;
    tasks: Task[];
    isOpen: boolean;
    onToggle: () => void;
    bgColor: string;
    iconColor: string;
    count: number;
  }) => (
    <div>
      <div 
        className={`${bgColor} px-6 py-3 rounded-t-lg flex items-center justify-between cursor-pointer`}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-gray-900 font-semibold">{title}</h2>
          <span className="text-gray-900 font-medium">({count})</span>
        </div>
        <svg 
          className={`w-4 h-4 ${iconColor} transform transition-transform duration-200 ${isOpen ? '' : 'rotate-180'}`}
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className="bg-gray-50 rounded-b-lg">
          <Droppable droppableId={id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[100px] transition-all duration-200 ${
                  snapshot.isDraggingOver 
                    ? 'bg-opacity-50 border-2 border-dashed border-gray-300' 
                    : ''
                }`}
              >
                {tasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 mx-4 my-4 rounded-lg">
                    Drop tasks here
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <TaskItem
                          task={task}
                          provided={provided}
                          snapshot={snapshot}
                        />
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </div>
  );

  // Add this new component for the multi-select actions bar
  const MultiSelectActionsBar = () => {
    if (selectedTasks.size === 0) return null;
    
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black text-white rounded-lg shadow-lg flex items-center gap-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {selectedTasks.size} Tasks Selected
            </span>
            <button
              onClick={() => setSelectedTasks(new Set())}
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
            onClick={handleMultipleDelete}
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
                  handleMultipleStatusUpdate('TO-DO');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm"
              >
                To Do
              </button>
              <button
                onClick={() => {
                  handleMultipleStatusUpdate('IN-PROGRESS');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm"
              >
                In Progress
              </button>
              <button
                onClick={() => {
                  handleMultipleStatusUpdate('COMPLETED');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm"
              >
                Completed
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 font-mulish">
        {/* Top Controls Section */}
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex justify-between items-center">
            {/* View Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:shadow-sm'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'board'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:shadow-sm'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Board
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-700 font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
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
              <div className="flex items-center space-x-2">
                <input 
                  type="date"
                  value={dueDateFilter}
                  onChange={(e) => setDueDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-2xl text-sm bg-white"
                />
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
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
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
                onClick={() => setShowAddTask(true)}
                className="bg-[#7B1984] text-white px-6 py-2 rounded-2xl text-sm font-medium hover:bg-opacity-90"
              >
                ADD TASK
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Column Headers */}
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="grid grid-cols-4 gap-4 px-6 py-3 text-sm font-semibold text-gray-900">
                <div className="flex items-center ml-11">Task name</div>
                <div className="flex items-center justify-start">Due on</div>
                <div className="flex items-center justify-start">Task Status</div>
                <div className="flex items-center justify-start">Task Category</div>
              </div>
            </div>

            {/* Task Sections */}
            <div className="grid grid-cols-1 gap-6">
              <DroppableSection
                id="TO-DO"
                title="Todo"
                tasks={todoTasks}
                isOpen={openSections.todo}
                onToggle={() => toggleSection('todo')}
                bgColor="bg-[#FAC3FF]"
                iconColor="text-[#7B1984]"
                count={todoTasks.length}
              />
              <DroppableSection
                id="IN-PROGRESS"
                title="In-Progress"
                tasks={inProgressTasks}
                isOpen={openSections.inProgress}
                onToggle={() => toggleSection('inProgress')}
                bgColor="bg-[#99E5FF]"
                iconColor="text-[#0C8CE9]"
                count={inProgressTasks.length}
              />
              <DroppableSection
                id="COMPLETED"
                title="Completed"
                tasks={completedTasks}
                isOpen={openSections.completed}
                onToggle={() => toggleSection('completed')}
                bgColor="bg-[#CEFFCC]"
                iconColor="text-[#2BA324]"
                count={completedTasks.length}
              />
            </div>
          </>
        ) : (
          /* Board View */
          <div className="grid grid-cols-3 gap-6">
            {/* Todo Column */}
            <div className="bg-gray-50 rounded-lg">
              <div className="bg-[#FAC3FF] px-4 py-3 rounded-t-lg">
                <div className="flex items-center">
                  <h2 className="text-gray-900 font-semibold">Todo</h2>
                </div>
              </div>
              <Droppable droppableId="TO-DO">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 min-h-[calc(100vh-300px)] ${
                      snapshot.isDraggingOver ? 'bg-purple-50' : ''
                    }`}
                  >
                    {todoTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm mb-3 ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-[#7B1984] ring-opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="text-gray-400 hover:text-[#7B1984]"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* In Progress Column */}
            <div className="bg-gray-50 rounded-lg">
              <div className="bg-[#99E5FF] px-4 py-3 rounded-t-lg">
                <div className="flex items-center">
                  <h2 className="text-gray-900 font-semibold">In Progress</h2>
                </div>
              </div>
              <Droppable droppableId="IN-PROGRESS">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 min-h-[calc(100vh-300px)] ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {inProgressTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm mb-3 ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-[#0C8CE9] ring-opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="text-gray-400 hover:text-[#0C8CE9]"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Completed Column */}
            <div className="bg-gray-50 rounded-lg">
              <div className="bg-[#CEFFCC] px-4 py-3 rounded-t-lg">
                <div className="flex items-center">
                  <h2 className="text-gray-900 font-semibold">Completed</h2>
                </div>
              </div>
              <Droppable droppableId="COMPLETED">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 min-h-[calc(100vh-300px)] ${
                      snapshot.isDraggingOver ? 'bg-green-50' : ''
                    }`}
                  >
                    {completedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm mb-3 ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-[#2BA324] ring-opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="text-gray-400 hover:text-[#2BA324]"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        )}

        {/* Task Form */}
        {showAddTask && (
          <TaskForm
            onClose={() => {
              setShowAddTask(false);
              setEditingTask(null);
            }}
            onTaskAdded={handleTaskAdded}
            editingTask={editingTask}
          />
        )}

        {/* Add the new multi-select actions bar */}
        <MultiSelectActionsBar />
      </div>
    </DragDropContext>
  );
} 