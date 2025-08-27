import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { useLocation, useNavigate } from "react-router-dom";
import { Experience } from "../components/Experience";
import { UI } from "../components/UI";
import { AudioPermissions } from "../components/AudioPermissions";
import { AudioDebugger } from "../components/AudioDebugger";
import { ChatProvider } from "../hooks/useChat";

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const template = location.state?.template;

  // If no template is selected, redirect to home
  if (!template) {
    navigate("/");
    return null;
  }

  return (
    <ChatProvider template={template}>
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
    </ChatProvider>
  );
};

export default Interview;
