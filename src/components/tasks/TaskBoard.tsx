import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Task } from '../../types/Task';
import TaskItem from './TaskItem';
import { Icons } from '../../assets';

interface TaskBoardProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskBoard({
  todoTasks,
  inProgressTasks,
  completedTasks,
  onEdit,
  onDelete
}: TaskBoardProps) {
  const totalTasks = todoTasks.length + inProgressTasks.length + completedTasks.length;

  if (totalTasks === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <img src={Icons.search} alt="No results" className="w-64 h-64 mb-6" />
        <p className="text-lg text-gray-600">It looks like we can't find any results that match.</p>
      </div>
    );
  }

  const renderColumn = (title: string, tasks: Task[], droppableId: string, bgColor: string, accentColor: string) => (
    <div className="bg-[#F1F1F1] rounded-lg">
      <div className={`${bgColor} px-4 py-3 rounded-t-lg`}>
        <div className="flex items-center">
          <h2 className="text-gray-900 font-semibold">{title}</h2>
        </div>
      </div>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-4 min-h-[calc(100vh-300px)] ${
              snapshot.isDraggingOver ? `bg-${accentColor}-50` : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <TaskItem
                    task={task}
                    provided={provided}
                    snapshot={snapshot}
                    viewMode="board"
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      {renderColumn('Todo', todoTasks, 'TO-DO', 'bg-[#FAC3FF]', 'purple')}
      {renderColumn('In Progress', inProgressTasks, 'IN-PROGRESS', 'bg-[#99E5FF]', 'blue')}
      {renderColumn('Completed', completedTasks, 'COMPLETED', 'bg-[#CEFFCC]', 'green')}
    </div>
  );
} 