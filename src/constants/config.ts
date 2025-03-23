export const CONFIG = {
  sections: [
    { id: 'TO-DO', title: 'To Do' },
    { id: 'IN-PROGRESS', title: 'In Progress' },
    { id: 'COMPLETED', title: 'Completed' },
  ],
  taskCategories: ['Work', 'Personal'] as const,
  taskStatuses: ['TO-DO', 'IN-PROGRESS', 'COMPLETED'] as const,
  dateFormat: 'MMM dd, yyyy',
  defaultTaskStatus: 'TO-DO',
  defaultTaskCategory: 'Work',
} as const; 