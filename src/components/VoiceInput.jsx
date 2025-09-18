import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "react-use-audio-recorder";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useChat } from "../hooks/useChat";

export const VoiceInput = () => {
  const { chat, loading, message, waitingForAnswer, preparationPhase } =
    useChat();
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [showCaptions, setShowCaptions] = useState(false);
  const [useTextInput, setUseTextInput] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const textInputRef = useRef();
  const listeningTimerRef = useRef();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
    recordingTime,
    mediaRecorder,
  } = useAudioRecorder();

  // Update transcribed text when transcript changes - show even partial text
  useEffect(() => {
    console.log("Transcript changed:", transcript);
    console.log("Listening state:", listening);
    console.log("IsListening state:", isListening);

    if (transcript || isListening) {
      setTranscribedText(transcript || "");
      setShowCaptions(isListening); // Show captions while listening, even if no text yet
    }
  }, [transcript, isListening, listening]);

  // Auto-hide captions after 3 seconds of no speech
  useEffect(() => {
    if (!listening && transcript && !isListening) {
      const timer = setTimeout(() => {
        setShowCaptions(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [listening, transcript, isListening]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (listeningTimerRef.current) {
        clearInterval(listeningTimerRef.current);
      }
    };
  }, []);

  const startListening = async () => {
    if (!browserSupportsSpeechRecognition) {
      alert(
        "Your browser doesn't support speech recognition. Please use Chrome or Edge."
      );
      return;
    }

    console.log("Starting speech recognition...");

    // Request microphone permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted");
      stream.getTracks().forEach((track) => track.stop()); // Clean up
    } catch (error) {
      console.error("Microphone permission denied:", error);
      alert("Please allow microphone access to use voice input");
      return;
    }

    resetTranscript();
    setTranscribedText("");
    setIsListening(true);
    setShowCaptions(true); // Show captions immediately
    setListeningTime(0);

    console.log("Reset transcript and starting timers");

    // Start our own timer for listening time
    listeningTimerRef.current = setInterval(() => {
      setListeningTime((prev) => prev + 1);
    }, 1000);

    // Start both audio recording and speech recognition
    try {
      startRecording();
      console.log("Started audio recording");

      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
        interimResults: true,
      });
      console.log("Started speech recognition");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const stopListening = () => {
    console.log("stopListening called - Current transcript:", transcript);

    // Preserve the transcript value before stopping recognition
    const currentTranscript = transcript.trim();

    setIsListening(false);
    stopRecording();
    SpeechRecognition.stopListening();

    // Clear the listening timer
    if (listeningTimerRef.current) {
      clearInterval(listeningTimerRef.current);
      listeningTimerRef.current = null;
    }

    // Send the transcribed text to backend if we have any and we're waiting for an answer or in preparation phase
    if (currentTranscript && (waitingForAnswer || preparationPhase)) {
      console.log("VoiceInput sending transcript:", currentTranscript);
      console.log(
        "State - waitingForAnswer:",
        waitingForAnswer,
        "preparationPhase:",
        preparationPhase
      );
      chat(currentTranscript);

      // Clean up after sending
      setTimeout(() => {
        resetTranscript();
        setTranscribedText("");
        setShowCaptions(false);
      }, 100);
    } else {
      console.log(
        "VoiceInput NOT sending transcript. Transcript:",
        currentTranscript,
        "waitingForAnswer:",
        waitingForAnswer,
        "preparationPhase:",
        preparationPhase
      );

      // Clean up immediately if not sending
      resetTranscript();
      setTranscribedText("");
      setShowCaptions(false);
    }
  };

  const cancelListening = () => {
    setIsListening(false);
    stopRecording();
    SpeechRecognition.stopListening();

    // Clear the listening timer
    if (listeningTimerRef.current) {
      clearInterval(listeningTimerRef.current);
      listeningTimerRef.current = null;
    }

    resetTranscript();
    setTranscribedText("");
    setShowCaptions(false);
  };

  const sendTextMessage = () => {
    const text = textInputRef.current.value.trim();
    if (
      text &&
      !loading &&
      !message &&
      (waitingForAnswer || preparationPhase)
    ) {
      chat(text);
      textInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
        <div className="w-full p-4 rounded-md bg-opacity-50 bg-red-200 backdrop-blur-md text-red-800">
          Speech recognition not supported. Please use Chrome or Edge browser.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Live Captions Display */}
      {showCaptions && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-95 text-white p-4 rounded-xl max-w-lg text-center backdrop-blur-md border border-white border-opacity-20 shadow-lg">
            <div className="text-sm text-blue-100 mb-2 font-medium">
              🎤 You're saying:
            </div>
            <div className="text-xl font-semibold min-h-[28px] leading-relaxed">
              {transcribedText || (isListening ? "Start speaking..." : "")}
              {listening && transcribedText && (
                <span className="inline-block w-1 h-6 bg-white ml-1 animate-pulse"></span>
              )}
            </div>
            {listening && (
              <div className="flex justify-center mt-3 space-x-1">
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Mode Toggle */}
      <div className="flex justify-center mb-2 pointer-events-auto">
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-1 flex">
          <button
            onClick={() => setUseTextInput(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !useTextInput
                ? "bg-blue-500 text-white"
                : "text-white hover:bg-white hover:bg-opacity-20"
            }`}
          >
            🎤 Voice
          </button>
          <button
            onClick={() => setUseTextInput(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              useTextInput
                ? "bg-blue-500 text-white"
                : "text-white hover:bg-white hover:bg-opacity-20"
            }`}
          >
            ⌨️ Text
          </button>
        </div>
      </div>

      {/* Input Controls */}
      <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
        {useTextInput ? (
          // Text Input Mode
          <>
            <input
              ref={textInputRef}
              className={`flex-1 placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 backdrop-blur-md ${
                waitingForAnswer || preparationPhase
                  ? "bg-white"
                  : "bg-gray-300"
              }`}
              placeholder={
                preparationPhase
                  ? "Type your response (or wait 10s)..."
                  : waitingForAnswer
                  ? "Type your response..."
                  : "Wait for question..."
              }
              onKeyDown={handleKeyDown}
              disabled={
                loading || message || (!waitingForAnswer && !preparationPhase)
              }
            />
            <button
              onClick={sendTextMessage}
              disabled={
                loading || message || (!waitingForAnswer && !preparationPhase)
              }
              className={`${
                waitingForAnswer || preparationPhase
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white p-4 px-6 font-semibold uppercase rounded-md ${
                loading || message || (!waitingForAnswer && !preparationPhase)
                  ? "cursor-not-allowed opacity-30"
                  : ""
              }`}
            >
              Send
            </button>
          </>
        ) : !isListening ? (
          <>
            {/* Start Recording Button */}
            <button
              onClick={startListening}
              disabled={
                loading || message || (!waitingForAnswer && !preparationPhase)
              }
              className={`flex-1 ${
                waitingForAnswer || preparationPhase
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white p-4 rounded-md font-semibold uppercase flex items-center justify-center gap-2 ${
                loading || message || (!waitingForAnswer && !preparationPhase)
                  ? "cursor-not-allowed opacity-30"
                  : ""
              }`}
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
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
              {preparationPhase
                ? "Start Answering Early"
                : waitingForAnswer
                ? "Start Speaking"
                : "Wait for question..."}
            </button>
          </>
        ) : (
          <>
            {/* Recording Status Display */}
            <div className="flex-1 bg-red-500 bg-opacity-20 border-2 border-red-500 text-red-700 p-4 rounded-md flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">
                Listening... {listeningTime}s
              </span>
            </div>

            {/* Send Button */}
            <button
              onClick={stopListening}
              disabled={!transcript.trim()}
              className={`bg-green-500 hover:bg-green-600 text-white p-4 px-6 font-semibold uppercase rounded-md ${
                !transcript.trim() ? "cursor-not-allowed opacity-30" : ""
              }`}
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
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>

            {/* Cancel Button */}
            <button
              onClick={cancelListening}
              className="bg-gray-500 hover:bg-gray-600 text-white p-4 px-6 font-semibold uppercase rounded-md"
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
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </>
  );
};
