import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { TaskStatus, TaskCategory } from '../../types/Task';
import DatePicker from '../common/DatePicker';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: TaskCategory;
    dueDate: string;
    status: TaskStatus;
  }) => void;
}

export default function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TO-DO');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    if (!category) {
      setError('Category is required');
      return;
    }

    if (!status) {
      setError('Status is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        title: title.trim(),
        description,
        category,
        dueDate,
        status
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Work');
      setDueDate('');
      setStatus('TO-DO');
      
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-2xl shadow-lg">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Create Task
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Task Title */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Task Title*</label>
              <input
                type="text"
                placeholder="Task title"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <div className="border border-gray-200 rounded-lg">
                <textarea
                  placeholder="Description"
                  className="w-full p-3 text-sm min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex justify-between items-center px-3 py-2 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button type="button" className="p-1 hover:bg-gray-100 rounded">B</button>
                    <button type="button" className="p-1 hover:bg-gray-100 rounded">I</button>
                    <button type="button" className="p-1 hover:bg-gray-100 rounded">•</button>
                    <button type="button" className="p-1 hover:bg-gray-100 rounded">1.</button>
                  </div>
                  <span className="text-xs text-gray-400">0/300 characters</span>
                </div>
              </div>
            </div>

            {/* Task Category */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Task Category*</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm ${
                    category === 'Work' ? 'bg-[#7B1984] text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => setCategory('Work')}
                >
                  Work
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm ${
                    category === 'Personal' ? 'bg-[#7B1984] text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => setCategory('Personal')}
                >
                  Personal
                </button>
              </div>
            </div>

            {/* Due Date */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Due on*</label>
              <DatePicker
                selectedDate={dueDate}
                onChange={setDueDate}
              />
            </div>

            {/* Task Status */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Task Status*</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="">Choose</option>
                <option value="TO-DO">To Do</option>
                <option value="IN-PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Attachment */}
            <div className="mb-6">
              <label className="block text-sm mb-2">Attachment</label>
              <div className="border border-gray-200 border-dashed rounded-lg p-4 text-center text-sm text-gray-500">
                Drop your files here or <button type="button" className="text-blue-500">Update</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-[#7B1984] rounded-2xl hover:bg-opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'CREATING...' : 'CREATE'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 