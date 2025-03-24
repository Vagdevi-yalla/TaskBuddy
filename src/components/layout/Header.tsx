import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Icons } from '../../assets';

export default function Header() {
  const { user } = useAuth();

  return (
    <div className="bg-[#FAEEFC] md:bg-white font-mulish">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-[#7B1984] flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img src={Icons.logo} alt="TaskBuddy" className="hidden md:block w-8 h-8" />
              <span className="text-xl font-semibold text-gray-900">TaskBuddy</span>
            </div>
          </Link>

          {/* Profile Section */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-2">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
              )}
              <span className="hidden md:block text-sm text-gray-700">
                {user?.displayName || 'User'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 