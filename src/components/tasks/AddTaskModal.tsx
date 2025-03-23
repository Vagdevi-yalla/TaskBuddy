import { useState, useRef, useEffect } from 'react';
import { TaskCategory, TaskStatus } from '../../types/Task';
import { addTask } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { Icons } from '../../assets';
import DatePicker from '../common/DatePicker';
import StatusDropdown from '../common/StatusDropdown';

interface AddTaskModalProps {
  onClose: () => void;
  onTaskAdded: () => void;
}

export default function AddTaskModal({ onClose, onTaskAdded }: AddTaskModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TO-DO');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      await addTask(title, dueDate, category, user.uid, status, undefined, description);
      onTaskAdded();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDescriptionChange = () => {
    if (contentEditableRef.current) {
      const text = contentEditableRef.current.innerText;
      if (text.length <= 300) {
        setDescription(contentEditableRef.current.innerHTML);
        setCharCount(text.length);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const insertFormatting = (format: string) => {
    if (!contentEditableRef.current) return;
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (!selection || !range) return;

    // Save the current selection
    const selectedText = range.toString();
    
    // Create the formatted element
    const formattedElement = document.createElement('span');
    switch (format) {
      case 'bold':
        formattedElement.style.fontWeight = 'bold';
        break;
      case 'italic':
        formattedElement.style.fontStyle = 'italic';
        break;
      case 'strike':
        formattedElement.style.textDecoration = 'line-through';
        break;
      case 'bullet':
        // Insert bullet point at the start of each line
        const lines = selectedText.split('\n');
        const bulletedText = lines.map(line => `• ${line}`).join('\n');
        formattedElement.textContent = bulletedText;
        break;
      case 'number':
        // Insert numbers at the start of each line
        const numberedLines = selectedText.split('\n');
        const numberedText = numberedLines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        formattedElement.textContent = numberedText;
        break;
    }

    if (format === 'bullet' || format === 'number') {
      // For lists, replace the content
      range.deleteContents();
      range.insertNode(formattedElement);
    } else {
      // For inline formatting, wrap the selection
      formattedElement.textContent = selectedText;
      range.deleteContents();
      range.insertNode(formattedElement);
    }

    // Update the description state
    handleDescriptionChange();
  };

  const checkActiveFormats = () => {
    if (!contentEditableRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer as HTMLElement;
    const newActiveFormats = new Set<string>();

    // Check for text formatting
    if (window.getComputedStyle(parentElement).fontWeight === 'bold' || 
        parentElement.closest('[style*="font-weight: bold"]')) {
      newActiveFormats.add('bold');
    }
    if (window.getComputedStyle(parentElement).fontStyle === 'italic' || 
        parentElement.closest('[style*="font-style: italic"]')) {
      newActiveFormats.add('italic');
    }
    if (window.getComputedStyle(parentElement).textDecoration.includes('line-through') || 
        parentElement.closest('[style*="text-decoration: line-through"]')) {
      newActiveFormats.add('strike');
    }

    setActiveFormats(newActiveFormats);
  };

  const handleSelectionChange = () => {
    checkActiveFormats();
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center px-6 py-4">
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
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1984] focus:ring-1 focus:ring-[#7B1984] placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <div className="border border-gray-200 rounded-lg">
              <div className="px-3 py-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <img src={Icons.description} alt="description" className="w-4 h-4" />
                  <span>Description</span>
                </div>
              </div>
              <div
                ref={contentEditableRef}
                contentEditable
                onInput={handleDescriptionChange}
                className="w-full px-3 py-2 text-sm focus:outline-none min-h-[100px] overflow-auto"
                style={{ whiteSpace: 'pre-wrap' }}
              />
              <div className="flex items-center gap-2 px-3 py-2">
                <button 
                  type="button"
                  onClick={() => insertFormatting('bold')}
                  className={`p-1 rounded transition-colors min-w-[24px] font-medium ${
                    activeFormats.has('bold') 
                      ? 'bg-gray-200 text-[#7B1984]' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button 
                  type="button"
                  onClick={() => insertFormatting('italic')}
                  className={`p-1 rounded transition-colors min-w-[24px] italic ${
                    activeFormats.has('italic') 
                      ? 'bg-gray-200 text-[#7B1984]' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Italic"
                >
                  I
                </button>
                <button 
                  type="button"
                  onClick={() => insertFormatting('strike')}
                  className={`p-1 rounded transition-colors min-w-[24px] ${
                    activeFormats.has('strike') 
                      ? 'bg-gray-200 text-[#7B1984]' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Strike"
                >
                  S
                </button>
                <button 
                  type="button"
                  onClick={() => insertFormatting('bullet')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors min-w-[24px] text-gray-700"
                  title="Bullet List"
                >
                  •
                </button>
                <button 
                  type="button"
                  onClick={() => insertFormatting('number')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors min-w-[24px] text-gray-700"
                  title="Number List"
                >
                  ≡
                </button>
                <div className="flex-grow"></div>
                <div className="text-xs text-gray-500">
                  {charCount}/300 characters
                </div>
              </div>
            </div>
          </div>

          {/* Task Details Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Task Category */}
            <div>
              <label className="block text-sm mb-2">
                Task Category<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('Work')}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border ${
                    category === 'Work'
                      ? 'bg-[#7B1984] text-white border-[#7B1984]'
                      : 'border-gray-200 text-gray-700 hover:border-[#7B1984]'
                  }`}
                >
                  Work
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('Personal')}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border ${
                    category === 'Personal'
                      ? 'bg-[#7B1984] text-white border-[#7B1984]'
                      : 'border-gray-200 text-gray-700 hover:border-[#7B1984]'
                  }`}
                >
                  Personal
                </button>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm mb-2">
                Due on<span className="text-red-500">*</span>
              </label>
              <DatePicker
                selectedDate={dueDate}
                onChange={setDueDate}
              />
            </div>

            {/* Task Status */}
            <div>
              <label className="block text-sm mb-2">
                Task Status<span className="text-red-500">*</span>
              </label>
              <StatusDropdown
                value={status}
                onChange={setStatus}
              />
            </div>
          </div>

          {/* Attachment */}
          <div className="mb-6">
            <label className="block text-sm mb-2">Attachment</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="hidden"
              multiple
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
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
              <div className="mt-2">
                {files.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {file.name}
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