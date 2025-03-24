import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, TaskStatus, TaskCategory } from '../../types/Task';
import TaskItem from './TaskItem';
import { useState } from 'react';
import { Icons } from '../../assets';
import FilterDatePicker from '../common/FilterDatePicker';
import { useAuth } from '../../contexts/AuthContext';
import { addTask } from '../../services/taskService';

interface DroppableSectionProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  isOpen: boolean;
  onToggle: () => void;
  bgColor: string;
  iconColor: string;
  count: number;
  viewMode: 'list' | 'board';
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  selectedTasks?: Set<string>;
  onSelectTask?: (taskId: string) => void;
  onTaskAdded?: () => void;
}

export default function DroppableSection({
  id,
  title,
  tasks,
  isOpen,
  onToggle,
  bgColor,
  iconColor,
  count,
  viewMode,
  onEdit,
  onDelete,
  selectedTasks,
  onSelectTask,
  onTaskAdded
}: DroppableSectionProps) {
  const { user } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | ''>('');
  const [selectedDate, setSelectedDate] = useState('');

  const handleAddTask = async () => {
    if (!newTaskTitle || !user) {
      return;
    }

    try {
      // Use default values if not selected
      const taskStatus = selectedStatus || 'TO-DO';
      const taskCategory = selectedCategory || 'Work';
      const taskDate = selectedDate || new Date().toISOString().split('T')[0];

      await addTask(
        newTaskTitle,
        taskDate,
        taskCategory as TaskCategory,
        user.uid,
        taskStatus as TaskStatus
      );

      // Reset form
      setShowAddTask(false);
      setNewTaskTitle('');
      setSelectedStatus('');
      setSelectedCategory('');
      setSelectedDate('');
      
      // Refresh task list
      if (onTaskAdded) {
        await onTaskAdded();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg">
      <div 
        className={`${bgColor} px-4 py-3 flex items-center justify-between cursor-pointer`}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-gray-900 font-semibold">{title}</h2>
          <span className="text-gray-900 font-medium">({count})</span>
        </div>
        <svg 
          className={`w-4 h-4 ${iconColor} transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className="bg-white md:bg-[#F1F1F1]">
          {id === 'TO-DO' && (
            <div className="p-4 space-y-4">
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center text-[#7B1984] hover:text-opacity-80 pl-7 pb-3"
                >
                  <span className="text-2xl mr-2">+</span>
                  <span>Add Task</span>
                </button>
              </div>

              {showAddTask && (
                <div className="pl-[2.15rem] pt-3">
                  <div className="flex flex-col md:grid md:grid-cols-[3fr_1.2fr_1.2fr_1.2fr] gap-4 items-start md:items-center">
                    <input
                      type="text"
                      placeholder="Task Title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white md:bg-[#F1F1F1] rounded-lg focus:outline-none placeholder-gray-500 border border-gray-300 md:border-transparent"
                    />
                    <div className="w-full md:w-auto">
                      <FilterDatePicker
                        selectedDate={selectedDate}
                        onChange={setSelectedDate}
                        placeholder="Due Date"
                      />
                    </div>
                    
                    <div className="relative w-full md:w-auto" style={{ zIndex: 140 }}>
                      <button 
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className="w-full md:w-8 h-8 rounded-2xl md:rounded-full flex items-center justify-center bg-white md:bg-[#F1F1F1] hover:bg-gray-50 md:hover:bg-gray-200 border border-gray-300 md:border-transparent"
                      >
                        <span className="text-gray-600 text-xl">+</span>
                        <span className="ml-2 md:hidden">Status</span>
                      </button>
                      {showStatusDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-[#FFF9F9] border border-[#7B1984]/15 rounded-lg shadow-lg">
                          {['To-do', 'In-progress', 'Completed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                setSelectedStatus(status.toUpperCase() as TaskStatus);
                                setShowStatusDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#7B1984]/10 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedStatus && !showStatusDropdown && (
                        <div className="absolute top-1/2 left-10 -translate-y-1/2 bg-[#FFF9F9] px-3 py-1 rounded-lg text-sm border border-[#7B1984]/15">
                          {selectedStatus}
                        </div>
                      )}
                    </div>

                    <div className="relative w-full md:w-auto" style={{ zIndex: 140 }}>
                      <button 
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="w-full md:w-8 h-8 rounded-2xl md:rounded-full flex items-center justify-center bg-white md:bg-[#F1F1F1] hover:bg-gray-50 md:hover:bg-gray-200 border border-gray-300 md:border-transparent"
                      >
                        <span className="text-gray-600 text-xl">+</span>
                        <span className="ml-2 md:hidden">Category</span>
                      </button>
                      {showCategoryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-[#FFF9F9] border border-[#7B1984]/15 rounded-lg shadow-lg">
                          {['Work', 'Personal'].map((category) => (
                            <button
                              key={category}
                              onClick={() => {
                                setSelectedCategory(category as TaskCategory);
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#7B1984]/10 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedCategory && !showCategoryDropdown && (
                        <div className="absolute top-1/2 left-10 -translate-y-1/2 bg-[#FFF9F9] px-3 py-1 rounded-lg text-sm border border-[#7B1984]/15">
                          {selectedCategory}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={handleAddTask}
                      className="px-6 py-2 text-sm font-medium text-white bg-[#7B1984] rounded-2xl hover:bg-opacity-90 flex items-center"
                    >
                      ADD
                      <img src={Icons.enter} alt="enter" className="w-4 h-4 ml-2" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTask(false);
                        setNewTaskTitle('');
                        setSelectedDate('');
                        setSelectedStatus('TO-DO');
                        setSelectedCategory('');
                      }}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <Droppable droppableId={id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`transition-all duration-200 ${
                  snapshot.isDraggingOver 
                    ? 'bg-opacity-50 border-2 border-dashed border-gray-300' 
                    : ''
                }`}
              >
                {tasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No Tasks in {title}
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <TaskItem
                          task={task}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          isSelected={selectedTasks?.has(task.id)}
                          onSelect={onSelectTask}
                          viewMode={viewMode}
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
} 