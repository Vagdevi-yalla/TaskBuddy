import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import taskImg from '../assets/images/task.svg';
import taskListImage from '../assets/images/Task list view 3.svg';
import googleLogo from '../assets/images/google.svg';

export default function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-white overflow-hidden relative">
      {/* Mobile Circles - Only visible on mobile */}
      <div className="absolute inset-0 md:hidden">
        {/* Top right circles */}
        <div className="absolute top-0 right-0 w-[150px] h-[150px] translate-x-1/4 -translate-y-1/4">
          <div className="absolute inset-0 border border-[#7B1984] border-opacity-40 rounded-full"></div>
          <div className="absolute inset-[15px] border border-[#7B1984] border-opacity-40 rounded-full"></div>
          <div className="absolute inset-[30px] border border-[#7B1984] border-opacity-40 rounded-full"></div>
        </div>
        
        {/* Bottom left circles */}
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] -translate-x-1/4 translate-y-1/4">
          <div className="absolute inset-0 border border-[#7B1984] border-opacity-40 rounded-full"></div>
          <div className="absolute inset-[15px] border border-[#7B1984] border-opacity-40 rounded-full"></div>
          <div className="absolute inset-[30px] border border-[#7B1984] border-opacity-40 rounded-full"></div>
        </div>
        
        {/* Bottom right circles */}
        <div className="absolute bottom-0 right-0 w-[120px] h-[120px] translate-x-1/4 translate-y-1/4">
          <div className="absolute inset-0 border border-[#7B1984] border-opacity-40 rounded-full"></div>
          <div className="absolute inset-[12px] border border-[#7B1984] border-opacity-40 rounded-full"></div>
          <div className="absolute inset-[24px] border border-[#7B1984] border-opacity-40 rounded-full"></div>
        </div>
      </div>

      <div className="container mx-auto relative z-10 px-6 md:pl-16">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left column with text content */}
          <div className="w-full md:w-[440px] flex flex-col items-center md:items-start justify-center space-y-6">
            <div className="flex items-center gap-2">
              <img
                src={taskImg}
                alt="TaskBuddy"
                className="w-6 h-6"
              />
              <h1 className="text-[#7B1984] font-bold text-[28px]">
                TaskBuddy
              </h1>
            </div>
            
            <p className="text-gray-600 text-sm font-semibold leading-[1.4] max-w-[260px] text-center md:text-left px-4 md:px-0">
              Streamline your workflow and track progress effortlessly with our all-in-one task management app.
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full max-w-[400px] h-[52px] bg-black text-white rounded-[25px] hover:bg-black/90 transition-colors duration-200 font-medium text-[17px] flex items-center justify-center mt-4"
            >
              <img
                src={googleLogo}
                alt="Google"
                className="w-5 h-5 mr-4"
              />
              Continue with Google
            </button>

            {/* Concentric circles below button - Only visible on mobile */}
            <div className="relative w-[150px] h-[150px] md:hidden">
              <div className="absolute inset-0 border border-[#7B1984] border-opacity-40 rounded-full"></div>
              <div className="absolute inset-[15px] border border-[#7B1984] border-opacity-40 rounded-full"></div>
              <div className="absolute inset-[30px] border border-[#7B1984] border-opacity-40 rounded-full"></div>
            </div>
          </div>

          {/* Right column for image */}
          <div className="w-full md:w-1/2 relative mt-16 md:mt-0 hidden md:block">
            <div className="relative h-[600px] flex items-center">
              {/* Circles container */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#7B1984] border-opacity-60 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[600px] border border-[#7B1984] border-opacity-30 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[760px] border border-[#7B1984] border-opacity-30 rounded-full"></div>
              </div>
              <img
                src={taskListImage}
                alt="Task List View"
                className="relative z-10 w-[580px] h-auto object-contain ml-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 