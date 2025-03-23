import { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Task } from '../../types/Task';
import { TaskItem } from './TaskItem';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { format } from 'date-fns';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';

interface DroppableSectionProps {
  id: string;
  title: string;
  tasks: Task[];
  isOpen: boolean;
  onToggle: () => void;
  onTaskSelect: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  selectedTasks: Set<string>;
}

export const DroppableSection = ({
  id,
  title,
  tasks,
  isOpen,
  onToggle,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  selectedTasks,
}: DroppableSectionProps) => {
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineDate, setInlineDate] = useState<string | null>(null);
  const [inlineStatus, setInlineStatus] = useState('');
  const [inlineCategory, setInlineCategory] = useState('');

  const handleInlineSubmit = async () => {
    if (!inlineTitle.trim()) return;

    const taskData = {
      title: inlineTitle.trim(),
      description: '',
      dueDate: inlineDate || '',
      status: inlineStatus || CONFIG.defaultTaskStatus,
      category: inlineCategory || CONFIG.defaultTaskCategory,
    };

    // TODO: Add task using the task service
    setShowInlineForm(false);
    setInlineTitle('');
    setInlineDate(null);
    setInlineStatus('');
    setInlineCategory('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <span className="text-lg font-semibold text-gray-900">{title}</span>
          <span className="ml-2 text-sm text-gray-500">({tasks.length})</span>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="bg-[#F1F1F1] rounded-b-lg">
          {/* Column Headers */}
          <div className="grid grid-cols-4 gap-4 py-2 border-t-2 border-gray-200 text-sm font-semibold text-gray-900">
            <div className="flex items-center">Task name</div>
            <div className="flex items-center">Due on</div>
            <div className="flex items-center">Task Status</div>
            <div className="flex items-center">Task Category</div>
          </div>

          {id === 'TO-DO' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInlineForm(!showInlineForm);
                }}
                className="flex items-center text-[#7B1984] px-6 py-3 text-sm font-medium hover:bg-gray-100 w-full border-b border-gray-200"
              >
                <span className="mr-2">+</span> ADD TASK
              </button>
              
              {showInlineForm && (
                <div className="bg-[#F1F1F1] px-6 py-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Task Title"
                        value={inlineTitle}
                        onChange={(e) => setInlineTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F1F1F1] text-sm focus:outline-none placeholder-gray-500"
                      />
                    </div>
                    
                    <div className="flex items-center ml-12 relative">
                      <button 
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex items-center gap-2 text-gray-500 text-sm"
                      >
                        <img src="/src/assets/images/calendar.svg" alt="Calendar" className="w-4 h-4" />
                        {inlineDate ? format(new Date(inlineDate), 'MMM dd, yyyy') : 'Add date'}
                      </button>
                      {showDatePicker && (
                        <CustomDatePicker
                          selectedDate={inlineDate}
                          onDateSelect={(date) => {
                            setInlineDate(date);
                            setShowDatePicker(false);
                          }}
                          onClose={() => setShowDatePicker(false)}
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center ml-8">
                      <div className="relative flex items-center">
                        <button 
                          onClick={() => {
                            const dropdown = document.getElementById('statusDropdown');
                            if (dropdown) {
                              dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                            }
                          }}
                          className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-300"
                        >
                          <span className="text-xs">+</span>
                        </button>
                        {inlineStatus !== '' && (
                          <span className="ml-2 text-sm text-gray-600">{inlineStatus}</span>
                        )}
                        <div 
                          id="statusDropdown"
                          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 w-[150px] z-50"
                          style={{ display: 'none' }}
                        >
                          {CONFIG.taskStatuses.map(status => (
                            <button
                              key={status}
                              onClick={() => {
                                setInlineStatus(status);
                                const dropdown = document.getElementById('statusDropdown');
                                if (dropdown) dropdown.style.display = 'none';
                              }}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center ml-6">
                      <div className="relative flex items-center">
                        <button 
                          onClick={() => {
                            const dropdown = document.getElementById('categoryDropdown');
                            if (dropdown) {
                              dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                            }
                          }}
                          className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-300"
                        >
                          <span className="text-xs">+</span>
                        </button>
                        {inlineCategory !== '' && (
                          <span className="ml-2 text-sm text-gray-600">{inlineCategory}</span>
                        )}
                        <div 
                          id="categoryDropdown"
                          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 w-[150px] z-50"
                          style={{ display: 'none' }}
                        >
                          {CONFIG.taskCategories.map(category => (
                            <button
                              key={category}
                              onClick={() => {
                                setInlineCategory(category);
                                const dropdown = document.getElementById('categoryDropdown');
                                if (dropdown) dropdown.style.display = 'none';
                              }}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleInlineSubmit}
                      className="flex items-center px-6 py-2 bg-[#7B1984] text-white rounded-lg text-sm font-medium"
                    >
                      ADD
                      <img src="/src/assets/images/enter.svg" alt="Enter" className="w-4 h-4 ml-2" />
                    </button>
                    <button
                      onClick={() => setShowInlineForm(false)}
                      className="px-6 py-2 text-gray-600 text-sm font-medium"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

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
                  <div className="bg-[#F1F1F1] p-4">
                    <div className="text-center text-gray-500 py-4">
                      No Tasks in {title}
                    </div>
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <TaskItem
                          task={task}
                          provided={provided}
                          snapshot={snapshot}
                          onSelect={onTaskSelect}
                          onEdit={onTaskEdit}
                          onDelete={onTaskDelete}
                          isSelected={selectedTasks.has(task.id)}
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
}; 