export type TaskStatus = 'TO-DO' | 'IN-PROGRESS' | 'COMPLETED';
export type TaskCategory = 'Work' | 'Personal';

export interface ActivityLog {
  action: string;
  timestamp: Date;
}

export interface TaskAttachment {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  path: string;
  uploadedAt: string;
}

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
  activityLog?: ActivityLog[];
  attachments?: TaskAttachment[];
} 