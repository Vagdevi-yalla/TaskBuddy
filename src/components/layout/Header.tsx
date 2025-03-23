import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '../../assets';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white font-mulish">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-[#7B1984] flex items-center gap-2">
            {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <img src={Icons.logo} alt="TaskBuddy" className="w-8 h-8" />
          <span className="text-xl font-semibold text-gray-900">TaskBuddy</span>
        </div>
          </Link>

          <div className="relative group">
            <button className="flex items-center space-x-2 group">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
              )}
              <span className="text-sm text-gray-700">{user?.displayName || 'User'}</span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 