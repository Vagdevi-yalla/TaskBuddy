import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskStatus } from '../../types/Task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

interface EditTaskProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export function EditTask({ task, isOpen, onClose, onUpdate }: EditTaskProps) {
  const [description, setDescription] = useState(task.description);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [dueDate, setDueDate] = useState<Date>(new Date(task.dueDate));
  const [attachments, setAttachments] = useState<string[]>(task.attachments || []);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDescription(task.description);
      setCategory(task.category);
      setStatus(task.status);
      setDueDate(new Date(task.dueDate));
      setAttachments(task.attachments || []);
    }
  }, [isOpen, task]);

  const handleSave = async () => {
    try {
      await onUpdate(task.id, {
        description,
        category,
        status,
        dueDate: dueDate.toISOString(),
        attachments,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      // TODO: Implement file upload logic
      // const uploadedUrls = await Promise.all(
      //   Array.from(files).map(file => uploadFile(file))
      // );
      // setAttachments([...attachments, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Section - Edit Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Task Details</h3>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select value={category} onValueChange={(value: TaskCategory) => setCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TO-DO">To Do</SelectItem>
                    <SelectItem value="IN-PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Attachments</label>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded">
                    <span className="truncate">{attachment}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      {isUploading ? 'Uploading...' : 'Upload Files'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Right Section - Activity Log */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Activity History</h3>
            <div className="space-y-2">
              {task.activityLog?.map((activity, index) => (
                <div key={index} className="bg-secondary p-3 rounded">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), 'PPp')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 