import { useChat } from "../hooks/useChat";
import { VoiceInput } from "./VoiceInput";

export const UI = ({ hidden, ...props }) => {
  const {
    cameraZoomed,
    setCameraZoomed,
    template,
    interviewQuestions,
    currentQuestionIndex,
    interviewStarted,
    waitingForAnswer,
    preparationPhase,
  } = useChat();
  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">AI Interviewer 🤖</h1>
          {template ? (
            <div>
              <p className="text-sm text-gray-700 mb-1">{template.name}</p>
              {interviewStarted && interviewQuestions.length > 0 && (
                <div className="text-xs text-gray-600">
                  Question {currentQuestionIndex + 1} of{" "}
                  {interviewQuestions.length}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) /
                            interviewQuestions.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  {preparationPhase && (
                    <div className="text-blue-600 font-medium mt-1">
                      🧠 Preparation time... (10s to think)
                    </div>
                  )}
                  {waitingForAnswer && !preparationPhase && (
                    <div className="text-orange-600 font-medium mt-1">
                      ⏰ Speak your answer... (5s timeout)
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>Speak to start your interview session</p>
          )}
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        <VoiceInput />
      </div>
    </>
  );
};
