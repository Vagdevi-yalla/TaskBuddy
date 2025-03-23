export type TaskStatus = 'TO-DO' | 'IN-PROGRESS' | 'COMPLETED';
export type TaskCategory = 'Work' | 'Personal';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
} 