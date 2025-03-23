import { Icons } from '../../assets';
import { TaskStatus } from '../../types/Task';

interface StatusDropdownProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export default function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TaskStatus)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#7B1984] focus:ring-1 focus:ring-[#7B1984] appearance-none"
      >
        <option value="" disabled>CHOOSE</option>
        <option value="TO-DO">TO DO</option>
        <option value="IN-PROGRESS">IN PROGRESS</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>
    </div>
  );
} 