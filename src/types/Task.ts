export type TaskStatus = 'TO-DO' | 'IN-PROGRESS' | 'COMPLETED';
export type TaskCategory = 'Work' | 'Personal';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
  userId: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  order?: number;
  description: string;
} 