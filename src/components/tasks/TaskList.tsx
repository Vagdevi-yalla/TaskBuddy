import { Task } from '../../types/Task';
import DroppableSection from './DroppableSection';

interface TaskListProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  openSections: {
    todo: boolean;
    inProgress: boolean;
    completed: boolean;
  };
  onToggleSection: (section: 'todo' | 'inProgress' | 'completed') => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  selectedTasks: Set<string>;
  onSelectTask: (taskId: string) => void;
}

export default function TaskList({
  todoTasks,
  inProgressTasks,
  completedTasks,
  openSections,
  onToggleSection,
  onEdit,
  onDelete,
  selectedTasks,
  onSelectTask
}: TaskListProps) {
  return (
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
          onToggle={() => onToggleSection('todo')}
          bgColor="bg-[#FAC3FF]"
          iconColor="text-[#7B1984]"
          count={todoTasks.length}
          viewMode="list"
          onEdit={onEdit}
          onDelete={onDelete}
          selectedTasks={selectedTasks}
          onSelectTask={onSelectTask}
        />
        <DroppableSection
          id="IN-PROGRESS"
          title="In-Progress"
          tasks={inProgressTasks}
          isOpen={openSections.inProgress}
          onToggle={() => onToggleSection('inProgress')}
          bgColor="bg-[#99E5FF]"
          iconColor="text-[#0C8CE9]"
          count={inProgressTasks.length}
          viewMode="list"
          onEdit={onEdit}
          onDelete={onDelete}
          selectedTasks={selectedTasks}
          onSelectTask={onSelectTask}
        />
        <DroppableSection
          id="COMPLETED"
          title="Completed"
          tasks={completedTasks}
          isOpen={openSections.completed}
          onToggle={() => onToggleSection('completed')}
          bgColor="bg-[#CEFFCC]"
          iconColor="text-[#2BA324]"
          count={completedTasks.length}
          viewMode="list"
          onEdit={onEdit}
          onDelete={onDelete}
          selectedTasks={selectedTasks}
          onSelectTask={onSelectTask}
        />
      </div>
    </>
  );
} 