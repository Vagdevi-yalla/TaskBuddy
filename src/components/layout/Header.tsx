import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Link} from 'react-router-dom';
import taskImg from '../../assets/images/task_icon.svg';

export default function Header() {
  const { user } = useAuth();
 

  return (
    <div className="bg-white font-mulish">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold text-gray-900">
          <div className="flex items-center space-x-1">
              <div className="h-[50px] flex items-center">
                <img
                  src={taskImg}
                  alt="TaskBuddy"
                  className="w-[25px] h-10vh"
                />
              </div>
              <h1 className=" font-semibold text-[28px]">
                TaskBuddy
              </h1>
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
          </div>
        </div>
      </div>
    </div>
  );
} 