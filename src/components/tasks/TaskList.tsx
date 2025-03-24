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
  onTaskAdded: () => void;
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
  onSelectTask,
  onTaskAdded
}: TaskListProps) {
  return (
    <>
      {/* Column Headers */}
      <div className="bg-white rounded-lg mb-4 border-t border-[#000000]/10">
        <div className="grid grid-cols-[120px_3fr_1.2fr_1.2fr_1.2fr_100px] gap-4 py-2 text-sm font-semibold text-[#000000]/60">
          <div></div>
          <div>Task name</div>
          <div>Due on</div>
          <div>Task Status</div>
          <div>Task Category</div>
          <div></div>
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
          onTaskAdded={onTaskAdded}
        />
        <DroppableSection
          id="IN-PROGRESS"
          title="In-Progress"
          tasks={inProgressTasks}
          isOpen={openSections.inProgress}
          onToggle={() => onToggleSection('inProgress')}
          bgColor="bg-[#85D9F1]"
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
          iconColor="text-[#107C41]"
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