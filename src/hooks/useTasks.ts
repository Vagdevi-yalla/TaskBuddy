import { useState, useEffect } from 'react';
import { Task, TaskFormData, TaskStatus } from '../types/Task';
import { taskApi } from '../services/api/taskApi';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasks = await taskApi.getTasks(user!.uid);
      setTasks(tasks);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: TaskFormData) => {
    try {
      const newTask = await taskApi.addTask(taskData, user!.uid);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await taskApi.updateTaskStatus(taskId, status);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
    } catch (err) {
      setError('Failed to update task status');
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<TaskFormData>) => {
    try {
      await taskApi.updateTask(taskId, taskData);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      ));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    deleteTask,
    updateTask,
    refreshTasks: loadTasks,
  };
}; 