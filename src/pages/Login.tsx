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
      <div className="container mx-auto relative z-10 pl-8 md:pl-16">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left column with text content */}
          <div className="w-full md:w-[440px] flex flex-col items-center md:items-start justify-center space-y-5">
            <div className="flex items-center space-x-1">
              <div className="h-[50px] flex items-center">
                <img
                  src={taskImg}
                  alt="TaskBuddy"
                  className="w-[25px] h-10vh"
                />
              </div>
              <h1 className="text-[#7B1984] font-semibold text-[28px]">
                TaskBuddy
              </h1>
            </div>
            
            <p className="text-gray-600 text-[15px] font-semibold leading-[1.6] max-w-[360px]">
              Streamline your workflow and track progress effortlessly with our all-in-one task management app.
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full max-w-[400px] h-[52px] bg-black text-white rounded-[20px] hover:bg-black/90 transition-colors duration-200 font-medium text-[17px] flex items-center justify-center"
            >
              <img
                src={googleLogo}
                alt="Google"
                className="w-5 h-5 mr-4"
              />
              Continue with Google
            </button>
          </div>

          {/* Right column for image */}
          <div className="w-full md:w-1/2 relative mt-16 md:mt-0">
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