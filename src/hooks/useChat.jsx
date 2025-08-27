import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children, template }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [answerTimeout, setAnswerTimeout] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [preparationPhase, setPreparationPhase] = useState(false);
  const [preparationTimeout, setPreparationTimeout] = useState(null);
  const [speakingTimeout, setSpeakingTimeout] = useState(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isProcessingQuestion, setIsProcessingQuestion] = useState(false);

  // Initialize interview on load
  useEffect(() => {
    if (template && !interviewStarted) {
      initializeInterview();
    }
  }, [template, interviewStarted]);

  const initializeInterview = async () => {
    try {
      setLoading(true);

      // Generate interview questions based on template
      const response = await fetch(`${backendUrl}/interview/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: template.key,
          context: `Interview for ${template.name} position`,
        }),
      });

      const data = await response.json();

      if (data.success && data.questions) {
        setInterviewQuestions(data.questions);

        // Start directly with the first question from backend response
        if (data.questions[0]) {
          const firstQuestion = {
            text: data.questions[0].text,
            audio: data.questions[0].audio || null,
            lipsync: data.questions[0].lipsync || null,
            facialExpression: data.questions[0].facialExpression || "default",
            animation: data.questions[0].animation || "Talking_2",
          };
          setMessages([firstQuestion]);
        }
        setInterviewStarted(true);
      }
    } catch (error) {
      console.error("Error initializing interview:", error);
      // Fallback to basic chat mode
      const errorMessage = {
        text: "Welcome! I'm ready to help with your interview practice. How can I assist you today?",
        audio: null,
        lipsync: null,
        facialExpression: "default",
        animation: "Talking_1",
      };
      setMessages([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const chat = async (message) => {
    if (!message?.trim() || isProcessingQuestion) return;

    // If user starts speaking during preparation phase, end it early
    if (preparationPhase) {
      if (preparationTimeout) {
        clearTimeout(preparationTimeout);
        setPreparationTimeout(null);
      }
      endPreparationPhase();
    }

    // If user is speaking, reset the speaking timer
    if (isUserSpeaking && speakingTimeout) {
      clearTimeout(speakingTimeout);
      startSpeakingTimer();
    }

    // Set user as speaking and store the answer
    setIsUserSpeaking(true);
    setUserAnswer(message);

    // Move directly to next question without sending to backend
    await moveToNextQuestion();
  };

  const onMessagePlayed = () => {
    // Remove the current message from the queue
    setMessages((messages) => messages.slice(1));

    // Only start preparation phase if we're not already in it and this was a question
    // and we're not currently processing another question
    if (
      !preparationPhase &&
      !waitingForAnswer &&
      !isProcessingQuestion &&
      currentQuestionIndex < interviewQuestions.length
    ) {
      startPreparationPhase();
    }
  };

  const startPreparationPhase = () => {
    setPreparationPhase(true);
    setWaitingForAnswer(false);
    setIsProcessingQuestion(true);

    // Clear any existing timeouts
    if (preparationTimeout) clearTimeout(preparationTimeout);
    if (speakingTimeout) clearTimeout(speakingTimeout);

    // Start 10-second preparation timer
    const timeout = setTimeout(() => {
      endPreparationPhase();
    }, 10000);

    setPreparationTimeout(timeout);
  };

  const endPreparationPhase = () => {
    setPreparationPhase(false);
    setWaitingForAnswer(true);
    setIsUserSpeaking(false);

    // Start 5-second speaking timer
    startSpeakingTimer();
  };

  const startSpeakingTimer = () => {
    // Clear any existing timeout
    if (speakingTimeout) {
      clearTimeout(speakingTimeout);
    }

    // Set 5 second timeout for user to continue speaking
    const timeout = setTimeout(() => {
      handleSpeakingTimeout();
    }, 5000);

    setSpeakingTimeout(timeout);
  };

  const handleSpeakingTimeout = async () => {
    // User didn't continue speaking within 5 seconds, move to next question
    if (!isProcessingQuestion) {
      await moveToNextQuestion();
    }
  };

  const moveToNextQuestion = async () => {
    try {
      setLoading(true);

      // Move to next question if we have more
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setTimeout(() => {
          const nextQuestion = interviewQuestions[currentQuestionIndex + 1];

          // Use next question directly from backend response (should include audio/lipsync)
          const nextQuestionMessage = {
            text: nextQuestion.text,
            audio: nextQuestion.audio || null,
            lipsync: nextQuestion.lipsync || null,
            facialExpression: nextQuestion.facialExpression || "default",
            animation: nextQuestion.animation || "Talking_1",
          };

          setMessages((prevMessages) => [...prevMessages, nextQuestionMessage]);

          setCurrentQuestionIndex((prev) => prev + 1);
          setWaitingForAnswer(false);
        }, 2000); // 2 second delay before next question
      } else {
        // Interview completed
        setTimeout(() => {
          const completionMessage = {
            text: "That concludes our interview! Thank you for your time. You did great!",
            audio: null,
            lipsync: null,
            facialExpression: "smile",
            animation: "Talking_2",
          };

          setMessages((prevMessages) => [...prevMessages, completionMessage]);
        }, 2000);
      }
    } catch (error) {
      console.error("Error moving to next question:", error);
      const errorMessage = {
        text: "I'm sorry, I encountered an issue. Let's continue with the next question.",
        audio: null,
        lipsync: null,
        facialExpression: "sad",
        animation: "Talking_1",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
      setWaitingForAnswer(false);
      setPreparationPhase(false);
      setIsUserSpeaking(false);
      setIsProcessingQuestion(false);
      setUserAnswer("");
      if (preparationTimeout) {
        clearTimeout(preparationTimeout);
        setPreparationTimeout(null);
      }
      if (speakingTimeout) {
        clearTimeout(speakingTimeout);
        setSpeakingTimeout(null);
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (preparationTimeout) {
        clearTimeout(preparationTimeout);
      }
      if (speakingTimeout) {
        clearTimeout(speakingTimeout);
      }
    };
  }, [preparationTimeout, speakingTimeout]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        template,
        interviewQuestions,
        currentQuestionIndex,
        interviewStarted,
        waitingForAnswer,
        preparationPhase,
        isUserSpeaking,
        isProcessingQuestion,
        userAnswer,
        setUserAnswer,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
