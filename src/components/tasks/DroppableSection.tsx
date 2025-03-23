import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Task, TaskStatus } from '../../types/Task';
import TaskItem from './TaskItem';

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
  onSelectTask
}: DroppableSectionProps) {
  return (
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
                          viewMode={viewMode}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          isSelected={selectedTasks?.has(task.id)}
                          onSelect={onSelectTask}
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