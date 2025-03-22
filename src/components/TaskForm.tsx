import { useState, useEffect, useRef, DragEvent } from 'react';
import { TaskCategory, TaskStatus, Task } from '../types/Task';
import { addTask, updateTask } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';

interface TaskFormProps {
  onClose: () => void;
  onTaskAdded: () => void;
  editingTask?: Task | null;
}

export default function TaskForm({ onClose, onTaskAdded, editingTask }: TaskFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TO-DO');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate);
      setStatus(editingTask.status);
      setCategory(editingTask.category);
    }
  }, [editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title,
          dueDate,
          category,
          status,
          description
        });
      } else {
        await addTask(title, dueDate, category, user.uid, status, undefined, description);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 3000) {
      setDescription(text);
      setCharCount(text.length);
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    let newText = description;
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        newText = description.substring(0, start) + `**${selectedText}**` + description.substring(end);
        newCursorPos = end + 4;
        break;
      case 'strikethrough':
        newText = description.substring(0, start) + `~~${selectedText}~~` + description.substring(end);
        newCursorPos = end + 4;
        break;
      case 'bullet':
        const bulletText = selectedText
          .split('\n')
          .map(line => `• ${line}`)
          .join('\n');
        newText = description.substring(0, start) + bulletText + description.substring(end);
        newCursorPos = start + bulletText.length;
        break;
      case 'number':
        const numberedText = selectedText
          .split('\n')
          .map((line, i) => `${i + 1}. ${line}`)
          .join('\n');
        newText = description.substring(0, start) + numberedText + description.substring(end);
        newCursorPos = start + numberedText.length;
        break;
    }

    setDescription(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles));
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Create Task</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Task Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task title
            </label>
            <input
              type="text"
              placeholder="Add a task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1984] focus:ring-1 focus:ring-[#7B1984] placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                <button 
                  type="button" 
                  onClick={() => insertFormatting('bold')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('strikethrough')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Strikethrough"
                >
                  <span className="line-through">/</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('bullet')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Bullet List"
                >
                  <span>•</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('number')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Numbered List"
                >
                  <span>1.</span>
                </button>
              </div>
              <textarea
                ref={textareaRef}
                placeholder="Add a more detailed description..."
                value={description}
                onChange={handleDescriptionChange}
                className="w-full px-3 py-2 text-sm focus:outline-none min-h-[100px] resize-none placeholder-gray-400"
              />
              <div className="flex justify-end px-3 py-1 text-xs text-gray-500">
                {charCount}/3000 characters
              </div>
            </div>
          </div>

          {/* Task Details Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#7B1984] focus:ring-1 focus:ring-[#7B1984]"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due on
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1984] focus:ring-1 focus:ring-[#7B1984]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#7B1984] focus:ring-1 focus:ring-[#7B1984]"
              >
                <option value="TO-DO">Choose</option>
                <option value="TO-DO">To Do</option>
                <option value="IN-PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Attachment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
                ${isDragging ? 'border-[#7B1984] bg-purple-50' : 'border-gray-200 hover:border-[#7B1984]'}`}
            >
              <p className="text-sm text-gray-500">
                Drop your files here or <span className="text-[#7B1984]">upload</span>
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-[#7B1984] rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'CREATING...' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 