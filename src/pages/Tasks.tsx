import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserTasks, deleteTask, updateTaskStatus, updateTaskOrders } from '../services/taskService';
import { Task, TaskStatus } from '../types/Task';
import TaskForm from '../components/TaskForm';
import AddTaskModal from '../components/tasks/AddTaskModal';
import TaskHeader from '../components/tasks/TaskHeader';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import TaskBoard from '../components/tasks/TaskBoard';
import MultiSelectActionsBar from '../components/tasks/MultiSelectActionsBar';

type ViewMode = 'list' | 'board';

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

  useEffect(() => {
    if (user) {
      console.log('User changed, loading tasks');
      loadTasks();
    } else {
      console.log('No user, clearing tasks');
      setTasks([]);
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

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newTasks = Array.from(tasks);
    const sourceTasks = newTasks.filter(t => t.status === source.droppableId);
    const destTasks = destination.droppableId === source.droppableId
      ? sourceTasks
      : newTasks.filter(t => t.status === destination.droppableId);

    sourceTasks.splice(source.index, 1);

    if (destination.droppableId !== source.droppableId) {
      task.status = destination.droppableId as TaskStatus;
    }

    destTasks.splice(destination.index, 0, task);
    setTasks(newTasks);

    try {
      if (destination.droppableId !== source.droppableId) {
        await updateTaskStatus(draggableId, destination.droppableId as TaskStatus);
      }
      const tasksToUpdate = destination.droppableId === source.droppableId
        ? sourceTasks
        : [...sourceTasks, ...destTasks];
      await updateTaskOrders(tasksToUpdate);
    } catch (error) {
      console.error('Error updating task:', error);
      await loadTasks();
    }
  };

  const isWithinDateRange = (taskDate: string, filterDate: string) => {
    if (!taskDate || !filterDate) return true;
    
    const dueDate = new Date(taskDate);
    const selectedDate = new Date(filterDate);
    
    return dueDate.getFullYear() === selectedDate.getFullYear() &&
           dueDate.getMonth() === selectedDate.getMonth() &&
           dueDate.getDate() === selectedDate.getDate();
  };

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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 font-mulish">
        <TaskHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          onLogout={signOut}
        />

        <TaskFilters
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          dueDateFilter={dueDateFilter}
          setDueDateFilter={setDueDateFilter}
          search={search}
          setSearch={setSearch}
          onAddTask={() => setShowAddTask(true)}
        />

        {viewMode === 'list' ? (
          <TaskList
            todoTasks={todoTasks}
            inProgressTasks={inProgressTasks}
            completedTasks={completedTasks}
            openSections={openSections}
            onToggleSection={toggleSection}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            selectedTasks={selectedTasks}
            onSelectTask={handleSelectTask}
          />
        ) : (
          <TaskBoard
            todoTasks={todoTasks}
            inProgressTasks={inProgressTasks}
            completedTasks={completedTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}

        {showAddTask && !editingTask && (
          <AddTaskModal
            onClose={() => {
              setShowAddTask(false);
              setEditingTask(null);
            }}
            onTaskAdded={handleTaskAdded}
          />
        )}

        {editingTask && (
          <TaskForm
            onClose={() => {
              setShowAddTask(false);
              setEditingTask(null);
            }}
            onTaskAdded={handleTaskAdded}
            editingTask={editingTask}
          />
        )}

        <MultiSelectActionsBar
          selectedCount={selectedTasks.size}
          onClearSelection={() => setSelectedTasks(new Set())}
          onStatusUpdate={handleMultipleStatusUpdate}
          onDelete={handleMultipleDelete}
        />
      </div>
    </DragDropContext>
  );
} 