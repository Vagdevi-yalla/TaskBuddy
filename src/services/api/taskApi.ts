import { Task, TaskFormData, TaskStatus } from '../../types/Task';
import { db } from '../../firebase/config';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp 
} from 'firebase/firestore';

export const taskApi = {
  async getTasks(userId: string): Promise<Task[]> {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
      updatedAt: doc.data().updatedAt.toDate().toISOString(),
    })) as Task[];
  },

  async addTask(taskData: TaskFormData, userId: string): Promise<Task> {
    const tasksRef = collection(db, 'tasks');
    const now = Timestamp.now();
    
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: docRef.id,
      ...taskData,
      userId,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  },

  async updateTask(taskId: string, taskData: Partial<TaskFormData>): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: Timestamp.now(),
    });
  },
}; 