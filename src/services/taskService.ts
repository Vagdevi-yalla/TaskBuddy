import type {
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot
} from '@firebase/firestore-types';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Task, TaskStatus, TaskCategory } from '../types/Task';

const COLLECTION_NAME = 'tasks';

// Usage tracking
let dailyReads = 0;
let dailyWrites = 0;
let dailyDeletes = 0;

// Reset counters daily
setInterval(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Daily Usage Stats:');
    console.log(`- Reads: ${dailyReads}/50,000`);
    console.log(`- Writes: ${dailyWrites}/20,000`);
    console.log(`- Deletes: ${dailyDeletes}/20,000`);
  }
  dailyReads = 0;
  dailyWrites = 0;
  dailyDeletes = 0;
}, 86400000); // Reset every 24 hours

// Add a type converter to handle Firestore document conversion
const taskConverter: FirestoreDataConverter<Task> = {
  toFirestore(task: Task): DocumentData {
    const { id, ...taskData } = task;
    return {
      ...taskData,
      updatedAt: serverTimestamp()
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Task {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title,
      dueDate: data.dueDate,
      status: data.status as TaskStatus,
      category: data.category as TaskCategory,
      userId: data.userId,
      order: data.order || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      completed: data.completed || false,
      description: data.description || ''
    };
  }
};

// Get the tasks collection with the converter
const tasksCollection = collection(db, COLLECTION_NAME).withConverter(taskConverter);

export const createSampleTasks = async (userId: string): Promise<void> => {
  const sampleTasks = [
    {
      title: 'Complete Project Documentation',
      dueDate: '2024-03-15',
      status: 'TO-DO' as TaskStatus,
      category: 'Work' as TaskCategory,
      completed: false
    },
    {
      title: 'Gym Workout',
      dueDate: '2024-03-10',
      status: 'IN-PROGRESS' as TaskStatus,
      category: 'Personal' as TaskCategory,
      completed: false
    },
    {
      title: 'Team Meeting',
      dueDate: '2024-03-12',
      status: 'TO-DO' as TaskStatus,
      category: 'Work' as TaskCategory,
      completed: false
    },
    {
      title: 'Grocery Shopping',
      dueDate: '2024-03-11',
      status: 'COMPLETED' as TaskStatus,
      category: 'Personal' as TaskCategory,
      completed: true
    },
    {
      title: 'Review Pull Requests',
      dueDate: '2024-03-14',
      status: 'IN-PROGRESS' as TaskStatus,
      category: 'Work' as TaskCategory,
      completed: false
    },
    {
      title: 'Read Book',
      dueDate: '2024-03-13',
      status: 'TO-DO' as TaskStatus,
      category: 'Personal' as TaskCategory,
      completed: false
    }
  ];

  try {
    for (const task of sampleTasks) {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...task,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      dailyWrites++;
    }
  } catch (error) {
    console.error('Error creating sample tasks:', error);
    throw error;
  }
};

export const addTask = async (
  title: string,
  dueDate: string,
  category: TaskCategory,
  userId: string,
  status: TaskStatus = 'TO-DO',
  order?: number,
  description: string = ''
): Promise<string> => {
  try {
    console.log('Adding task with data:', { title, dueDate, category, userId, status, description });
    
    // Get the current highest order number
    const q = query(
      tasksCollection,
      where('userId', '==', userId),
      orderBy('order', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    dailyReads++;
    const highestOrder = querySnapshot.docs[0]?.data()?.order ?? -1;
    console.log('Current highest order:', highestOrder);

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      dueDate,
      status,
      category,
      userId,
      completed: status === 'COMPLETED',
      order: order ?? highestOrder + 1,
      description
    };

    const docRef = await addDoc(tasksCollection, {
      ...newTask,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    } as Task);

    dailyWrites++;
    console.log('Task added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding task:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add task');
  }
};

export const fetchUserTasks = async (userId: string): Promise<Task[]> => {
  console.log('Fetching tasks for user:', userId);
  try {
    // Using the existing index structure
    const q = query(
      tasksCollection,
      where('userId', '==', userId),
      orderBy('order', 'desc'),
      orderBy('__name__', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    dailyReads += querySnapshot.size;
    
    // Map documents to tasks and reverse for ascending order
    const tasks = querySnapshot.docs.map((doc: QueryDocumentSnapshot<Task>) => doc.data());
    return tasks.reverse();
  } catch (error) {
    console.error('Error in fetchUserTasks:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch tasks');
  }
};

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp()
    });
    dailyWrites++;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

export const updateTaskCompletion = async (
  taskId: string,
  completed: boolean
): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      completed,
      status: completed ? 'COMPLETED' as TaskStatus : 'TO-DO' as TaskStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task completion:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await deleteDoc(taskRef);
    dailyDeletes++;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const updateTaskOrders = async (tasks: Task[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    tasks.forEach((task, index) => {
      const taskRef = doc(db, COLLECTION_NAME, task.id);
      batch.update(taskRef, { 
        order: index,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    dailyWrites += tasks.length;
  } catch (error) {
    console.error('Error updating task orders:', error);
    throw error;
  }
};

// Add this interface for task updates
interface TaskUpdate {
  title: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
  completed: boolean;
}

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    dailyWrites++;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}; 