export default function CreateTaskModal({ isOpen, onClose, onSubmit }) {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full md:w-[600px] bg-white rounded-lg">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <Dialog.Title className="text-xl font-semibold">Create Task</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* Task Title */}
            <div className="mb-4">
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
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Task Status */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Task Status*</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-200 rounded-lg text-sm"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#7B1984] text-white rounded-lg text-sm"
              >
                CREATE
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 