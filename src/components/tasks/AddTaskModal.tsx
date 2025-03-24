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
  const textareaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await addTask(
        title,
        dueDate,
        category,
        user.uid,
        status,
        undefined,
        description,
        files
      );
      onTaskAdded();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Initialize the contentEditable div with initial content
    if (textareaRef.current) {
      textareaRef.current.innerHTML = description;
    }
  }, [description]);

  const handleDescriptionChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    const html = e.currentTarget.innerHTML;
    if (text.length <= 300) {
      setDescription(html);
      setCharCount(text.length);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleFormatting = (format: string) => {
    const div = textareaRef.current;
    if (!div) return;
    
    div.focus();
    
    // Get or create selection
    const selection = window.getSelection();
    if (!selection) return;
    
    // If no selection exists, create one at cursor position
    if (selection.rangeCount === 0) {
      const range = document.createRange();
      range.selectNodeContents(div);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Get the current range
    const range = selection.getRangeAt(0);
    
    // If no text is selected, select the current line
    if (selection.toString().trim() === '') {
      let node = selection.anchorNode;
      if (node?.nodeType === Node.TEXT_NODE && node.parentNode) {
        node = node.parentNode;
      }
      
      // Find the closest block-level element
      let blockElement = node;
      while (blockElement && blockElement !== div && !['P', 'DIV', 'LI'].includes(blockElement.nodeName)) {
        blockElement = blockElement.parentNode;
      }
      
      if (blockElement && blockElement !== div) {
        range.selectNodeContents(blockElement);
      }
    }
    
    switch (format) {
      case 'bold': {
        document.execCommand('bold', false);
        break;
      }
      case 'italic': {
        document.execCommand('italic', false);
        break;
      }
      case 'strike': {
        document.execCommand('strikeThrough', false);
        break;
      }
      case 'bullet': {
        const parentList = range.commonAncestorContainer.parentElement?.closest('ul, ol');
        if (!parentList) {
          document.execCommand('insertUnorderedList', false);
        } else if (parentList.tagName === 'OL') {
          const listItems = Array.from(parentList.children);
          const newList = document.createElement('ul');
          listItems.forEach(li => newList.appendChild(li.cloneNode(true)));
          parentList.replaceWith(newList);
        } else {
          document.execCommand('insertUnorderedList', false);
        }
        break;
      }
      case 'number': {
        const parentOList = range.commonAncestorContainer.parentElement?.closest('ul, ol');
        if (!parentOList) {
          document.execCommand('insertOrderedList', false);
        } else if (parentOList.tagName === 'UL') {
          const listItems = Array.from(parentOList.children);
          const newList = document.createElement('ol');
          listItems.forEach(li => newList.appendChild(li.cloneNode(true)));
          parentOList.replaceWith(newList);
        } else {
          document.execCommand('insertOrderedList', false);
        }
        break;
      }
    }
    
    // Update description state with HTML content
    setDescription(div.innerHTML);
    setCharCount(div.textContent?.length || 0);
  };

  const handleSelectionChange = () => {
    // Implementation of handleSelectionChange
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b-2 border-[#f1f1f1] flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">Create Task</h3>
          <button 
            onClick={onClose}
            className="text-black hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto">
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
                ref={textareaRef}
                contentEditable
                onInput={handleDescriptionChange}
                className="w-full px-3 py-2 text-sm focus:outline-none min-h-[100px] overflow-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                style={{ resize: 'none' }}
                data-placeholder="Add a description..."
              />
              <div className="flex items-center gap-2 px-3 py-2">
                <button 
                  type="button"
                  onClick={() => handleFormatting('bold')}
                  className="p-1 rounded transition-colors min-w-[24px] font-medium hover:bg-gray-100 text-gray-700"
                  title="Bold"
                >
                  <img src={Icons.bold} alt="bold" className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => handleFormatting('italic')}
                  className="p-1 rounded transition-colors min-w-[24px] italic hover:bg-gray-100 text-gray-700"
                  title="Italic"
                >
                  <img src={Icons.italic} alt="italic" className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => handleFormatting('strike')}
                  className="p-1 rounded transition-colors min-w-[24px] hover:bg-gray-100 text-gray-700"
                  title="Strike"
                >
                  <img src={Icons.strike} alt="strike" className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => handleFormatting('bullet')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors min-w-[24px] text-gray-700"
                  title="Bullet List"
                >
                  <img src={Icons.bullet} alt="bullet list" className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => handleFormatting('number')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors min-w-[24px] text-gray-700"
                  title="Number List"
                >
                  <img src={Icons.listing} alt="number list" className="w-4 h-4" />
                </button>
                <div className="flex-grow"></div>
                <div className="text-xs text-gray-500">
                  {charCount}/300 characters
                </div>
              </div>
            </div>
          </div>

          {/* Task Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Task Category */}
            <div>
              <label className="block text-sm mb-2">
                Task Category<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('Work')}
                  className={`flex-1 px-4 py-2 text-sm rounded-2xl border ${
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
                  className={`flex-1 px-4 py-2 text-sm rounded-2xl border ${
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
      </div>
    </div>
  );
} 