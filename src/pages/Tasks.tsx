import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { ArrowRightOnRectangleIcon as SolidArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

import { DragDropContext, Draggable, Droppable, DropResult, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserTasks, deleteTask, updateTaskStatus, updateTaskOrders, addTask } from '../services/taskService';
import { Task, TaskStatus, TaskCategory } from '../types/Task';
import TaskForm from '../components/TaskForm';
import listIcon from "../assets/images/list.png"
import boardIcon from "../assets/images/Group 1171276211.png"
import { format } from 'date-fns';
import { useTasks } from '../hooks/useTasks';
import { DroppableSection } from '../components/tasks/DroppableSection';
import { MultiSelectActionsBar } from '../components/tasks/MultiSelectActionsBar';
import { CONFIG } from '../constants/config';
import { CustomDatePicker } from '../components/common/CustomDatePicker';


type ViewMode = 'list' | 'board';

interface TaskItemProps {
  task: Task;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

export const Tasks = () => {
  const { user, signOut } = useAuth();
  const { 
    tasks, 
    loading, 
    error,
    addTask: useTasksAddTask,
    updateTaskStatus: useTasksUpdateTaskStatus,
    deleteTask: useTasksDeleteTask,
    updateTask: useTasksUpdateTask,
    refreshTasks
  } = useTasks();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState({
    todo: true,
    inProgress: true,
    completed: true
  });
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showFilterDatePicker, setShowFilterDatePicker] = useState(false);

  const toggleSection = (section: 'todo' | 'inProgress' | 'completed') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    try {
      await useTasksUpdateTaskStatus(draggableId, destination.droppableId as Task['status']);
      await refreshTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(Array.from(selectedTasks).map(taskId => useTasksDeleteTask(taskId)));
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Error deleting selected tasks:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowAddTask(true);
  };

  const handleTaskAdded = async () => {
    console.log('Task added, refreshing task list');
    setEditingTask(null);
    await refreshTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await useTasksDeleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleMultipleStatusUpdate = async (status: TaskStatus) => {
    try {
      for (const taskId of selectedTasks) {
        await useTasksUpdateTaskStatus(taskId, status);
      }
      setSelectedTasks(new Set());
      await refreshTasks();
    } catch (error) {
      console.error('Error updating multiple tasks:', error);
    }
  };

  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const matchesDate = !dueDateFilter || task.dueDate === dueDateFilter;
      return matchesSearch && matchesCategory && matchesDate;
    });
  };

  const todoTasks = filterTasks(tasks.filter(task => task.status === 'TO-DO'));
  const inProgressTasks = filterTasks(tasks.filter(task => task.status === 'IN-PROGRESS'));
  const completedTasks = filterTasks(tasks.filter(task => task.status === 'COMPLETED'));

  const TaskItem = ({ task, provided, snapshot }: TaskItemProps) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`bg-[#F1F1F1] border-b border-gray-200 transition-all duration-200 ${
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
              <div className="relative mr-6">
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
                        handleEditTask(task);
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
                        handleDeleteTask(task.id);
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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Bars3Icon className="w-6 h-6 text-gray-500" />
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <SolidArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1984] focus:border-transparent"
              />
            </div>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-2xl text-sm bg-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Category</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
            </select>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDatePicker(!showFilterDatePicker)}
                className="px-4 py-2 border border-gray-300 rounded-2xl text-sm bg-white flex items-center gap-2"
              >
                <img src="/src/assets/images/calendar.svg" alt="Calendar" className="w-4 h-4" />
                Due Date
              </button>
              {showFilterDatePicker && (
                <CustomDatePicker
                  selectedDate={dueDateFilter}
                  onDateSelect={(date) => {
                    setDueDateFilter(date);
                    setShowFilterDatePicker(false);
                  }}
                  onClose={() => setShowFilterDatePicker(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="rounded-lg">
          <div className="grid grid-cols-4 gap-4 py-2 border-t-2 border-gray-200 text-sm font-semibold text-gray-900">
            <div className="flex items-center ml-9">Task name</div>
            <div className="flex items-center">Due on</div>
            <div className="flex items-center">Task Status</div>
            <div className="flex items-center">Task Category</div>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {CONFIG.sections.map(section => (
              <DroppableSection
                key={section.id}
                id={section.id}
                title={section.title}
                tasks={section.id === 'TO-DO' ? todoTasks :
                       section.id === 'IN-PROGRESS' ? inProgressTasks :
                       completedTasks}
                isOpen={openSections[section.id.toLowerCase().replace('-', '') as keyof typeof openSections]}
                onToggle={() => toggleSection(section.id.toLowerCase().replace('-', '') as keyof typeof openSections)}
                onTaskSelect={handleSelectTask}
                onTaskEdit={handleEditTask}
                onTaskDelete={handleDeleteTask}
                selectedTasks={selectedTasks}
              />
            ))}
          </div>
        </DragDropContext>

        <MultiSelectActionsBar
          selectedCount={selectedTasks.size}
          onDelete={handleDeleteSelected}
        />
      </div>
    </div>
  );
} 