import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Experience } from "../components/Experience";
import { UI } from "../components/UI";
import { AudioPermissions } from "../components/AudioPermissions";
import { AudioDebugger } from "../components/AudioDebugger";
import { InterviewPerformance } from "../components/InterviewPerformance";
import { ChatProvider, useChat } from "../hooks/useChat";

const InterviewContent = ({ template, navigate }) => {
  const { sessionPerformance, currentQuestionIndex, interviewQuestions } = useChat();

  // Check if interview is completed (all questions answered and performance data is available)
  const isInterviewCompleted = sessionPerformance && 
    currentQuestionIndex >= interviewQuestions.length - 1;

  // If interview is completed, show performance report
  if (isInterviewCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 py-8">
        <div className="container mx-auto px-4">
          <InterviewPerformance />
        </div>
      </div>
    );
  }

  // Otherwise, show the normal interview interface
  return (
    <AudioPermissions>
      <div className="relative w-full h-screen">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 z-20 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all duration-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Templates
        </button>

        {/* Template Info Header */}
        <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg backdrop-blur-md">
          <div className="text-sm font-medium">{template.name}</div>
          <div className="text-xs text-gray-300">{template.category}</div>
        </div>

        {/* 3D Scene */}
        <Loader />
        <Leva hidden />
        <UI />
        <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <Experience />
        </Canvas>

        {/* Audio Debug Panel - Enable in development */}
        <AudioDebugger enabled={import.meta.env.DEV} />

        {/* Interview Session Info */}
        <div className="absolute bottom-4 left-4 z-20 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg backdrop-blur-md">
          <div className="text-sm">🎤 Voice Interview Active</div>
          <div className="text-xs text-gray-300">
            Speak naturally to interact with the AI
          </div>
        </div>
      </div>
    </AudioPermissions>
  );
};

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const template = location.state?.template;

  // If not authenticated, redirect to home
  if (!authLoading && !isAuthenticated) {
    navigate("/");
    return null;
  }

  // If no template is selected, redirect to home
  if (!template) {
    navigate("/");
    return null;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider template={template}>
      <InterviewContent template={template} navigate={navigate} />
    </ChatProvider>
  );
};

export default Interview;
