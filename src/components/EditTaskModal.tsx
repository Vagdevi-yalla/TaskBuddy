import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus, TaskCategory, ActivityLog, TaskAttachment } from '../types/Task';
import { updateTask } from '../services/taskService';
import { Icons } from '../assets';
import DatePicker from './common/DatePicker';
import StatusDropdown from './common/StatusDropdown';
import { useAuth } from '../contexts/AuthContext';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated: () => void;
}

export default function EditTaskModal({ isOpen, onClose, task, onTaskUpdated }: EditTaskModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(task.description?.length || 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<TaskAttachment[]>(task.attachments || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(task.activityLog || []);
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const descriptionTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDescriptionRef = useRef(description);

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate || '');
    setStatus(task.status);
    setCategory(task.category);
    setCharCount(task.description?.length || 0);
    setAttachments(task.attachments || []);
    setNewFiles([]);
    setActivityLog(task.activityLog || []);
  }, [task]);

  // Initialize and update contentEditable div when task changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.innerHTML = description;
    }
  }, [description]);

  const addActivityLog = (action: string) => {
    const newLog: ActivityLog = {
      action,
      timestamp: new Date()
    };
    setActivityLog(prev => [...prev, newLog]);
  };

  const handleDescriptionChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    const html = e.currentTarget.innerHTML;
    if (text.length <= 300) {
      setDescription(html);
      setCharCount(text.length);
      
      // Clear any existing timeout
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current);
      }

      // Set a new timeout to log the change after 1 second of inactivity
      descriptionTimeoutRef.current = setTimeout(() => {
        if (text !== lastDescriptionRef.current) {
          addActivityLog(`Changed description from "${lastDescriptionRef.current}" to "${text}"`);
          lastDescriptionRef.current = text;
        }
      }, 1000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current);
      }
    };
  }, []);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    const newAttachments = droppedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      path: file.name,
      uploadedAt: new Date().toISOString()
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    addActivityLog(`Added ${droppedFiles.length} file(s)`);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newAttachments = Array.from(selectedFiles).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        path: file.name,
        uploadedAt: new Date().toISOString()
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
      addActivityLog(`Added ${selectedFiles.length} file(s)`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      const removedFile = newAttachments.splice(index, 1)[0];
      addActivityLog(`Removed file: ${removedFile.name}`);
      return newAttachments;
    });
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
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'strike':
        document.execCommand('strikeThrough', false);
        break;
      case 'bullet':
        const parentList = range.commonAncestorContainer.parentElement?.closest('ul, ol');
        if (!parentList) {
          // Not in a list, create new unordered list
          document.execCommand('insertUnorderedList', false);
        } else if (parentList.tagName === 'OL') {
          // Convert ordered list to unordered
          const listItems = Array.from(parentList.children);
          const newList = document.createElement('ul');
          listItems.forEach(li => newList.appendChild(li.cloneNode(true)));
          parentList.replaceWith(newList);
        } else {
          // Toggle existing unordered list
          document.execCommand('insertUnorderedList', false);
        }
        break;
      case 'number':
        const parentOList = range.commonAncestorContainer.parentElement?.closest('ul, ol');
        if (!parentOList) {
          // Not in a list, create new ordered list
          document.execCommand('insertOrderedList', false);
        } else if (parentOList.tagName === 'UL') {
          // Convert unordered list to ordered
          const listItems = Array.from(parentOList.children);
          const newList = document.createElement('ol');
          listItems.forEach(li => newList.appendChild(li.cloneNode(true)));
          parentOList.replaceWith(newList);
        } else {
          // Toggle existing ordered list
          document.execCommand('insertOrderedList', false);
        }
        break;
    }
    
    // Update description state with HTML content
    setDescription(div.innerHTML);
    setCharCount(div.textContent?.length || 0);
    addActivityLog(`Applied ${format} formatting`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updates: Partial<Task> = {
        title,
        description,
        dueDate,
        category,
        status,
        completed: status === 'COMPLETED',
        attachments: [...attachments],
        activityLog
      };

      // Handle new files
      if (newFiles.length > 0) {
        const newAttachments: TaskAttachment[] = newFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          path: `/tasks/${task.id}/${file.name}`,
          uploadedAt: new Date().toISOString()
        }));
        updates.attachments = [...attachments, ...newAttachments];
      }

      await updateTask(task.id, updates);
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-[1000]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[1000px] mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b-2 border-[#f1f1f1]">
          <h3 className="text-xl font-semibold text-gray-900">Edit Task</h3>
          <button 
            onClick={onClose}
            className="text-black hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="flex gap-2 p-4 md:hidden">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-full ${
              activeTab === 'details'
                ? 'bg-black text-white'
                : 'bg-[#F1F1F1] text-gray-600'
            }`}
            onClick={() => setActiveTab('details')}
          >
            DETAILS
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-full ${
              activeTab === 'activity'
                ? 'bg-black text-white'
                : 'bg-[#F1F1F1] text-gray-600'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            ACTIVITY
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Edit Task Section */}
          <div className={`flex-1 p-6 overflow-y-auto ${
            activeTab === 'details' ? 'block' : 'hidden md:block'
          }`}>
            <form id="edit-task-form" onSubmit={handleSubmit}>
              {/* Task Title */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    addActivityLog('Updated task title');
                  }}
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
                      onClick={() => {
                        setCategory('Work');
                        addActivityLog('Changed category to Work');
                      }}
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
                      onClick={() => {
                        setCategory('Personal');
                        addActivityLog('Changed category to Personal');
                      }}
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
                    onChange={(date) => {
                      setDueDate(date);
                      addActivityLog('Updated due date');
                    }}
                  />
                </div>

                {/* Task Status */}
                <div>
                  <label className="block text-sm mb-2">
                    Task Status<span className="text-red-500">*</span>
                  </label>
                  <StatusDropdown
                    value={status}
                    onChange={(newStatus) => {
                      setStatus(newStatus);
                      addActivityLog(`Changed status to ${newStatus}`);
                    }}
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="mb-6">
                <label className="block text-sm mb-2">Attachment</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
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
                
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <img src={Icons.add} alt="file" className="w-4 h-4" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Activity Section */}
          <div className={`flex-1 md:w-80 bg-gray-50 border-l border-gray-200 ${
            activeTab === 'activity' ? 'block' : 'hidden md:block'
          }`}>
            <div className="h-full p-6 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Activity</h3>
              <div className="space-y-4">
                {activityLog.map((log, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{log.action}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50"
          >
            CANCEL
          </button>
          <button
            type="submit"
            form="edit-task-form"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-[#7B1984] rounded-2xl hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'UPDATING...' : 'UPDATE'}
          </button>
        </div>
      </div>
    </div>
  );
} 