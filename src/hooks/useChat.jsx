import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSession } from "../contexts/SessionContext";

const backendUrl = "http://localhost:5000";

// Helper function to normalize difficulty values
const normalizeDifficulty = (difficulty) => {
  const difficultyMap = {
    easy: "easy",
    medium: "medium",
    intermediate: "medium", // Map intermediate to medium
    hard: "hard",
    difficult: "hard", // Map difficult to hard
    advanced: "hard", // Map advanced to hard
  };

  return difficultyMap[difficulty?.toLowerCase()] || "medium";
};

// Helper function to ensure valid user answer for backend validation
const normalizeUserAnswer = (answer) => {
  if (!answer || answer.trim() === "") {
    return "No answer provided";
  }
  return answer.trim();
};

const ChatContext = createContext();

export const ChatProvider = ({ children, template }) => {
  const { token } = useAuth();
  const {
    createSession,
    startSession,
    endSession,
    updateQuestionCount,
    createConversation,
    submitAnswer,
    createPerformanceRecord,
    getSessionPerformance,
    currentSession,
    setCurrentSession,
  } = useSession();

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
  // Removed speakingTimeout - user controls when to send answer
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isProcessingQuestion, setIsProcessingQuestion] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [answerStartTime, setAnswerStartTime] = useState(null);
  const [sessionPerformance, setSessionPerformance] = useState(null);

  // Initialize interview on load
  useEffect(() => {
    if (template && !interviewStarted) {
      initializeInterview();
    }
  }, [template, interviewStarted]);

  const initializeInterview = async () => {
    try {
      setLoading(true);

      // First, create a session for this interview
      const sessionResult = await createSession({
        session_name: `${template.name} Interview`,
        session_type: "interview",
        session_metadata: {
          template_key: template.key,
          template_name: template.name,
          template_category: template.category,
        },
      });

      if (!sessionResult.success) {
        throw new Error("Failed to create session");
      }

      // Start the session
      await startSession(sessionResult.session.id);

      // Generate interview questions based on template
      const response = await fetch(`${backendUrl}/interview/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: template.key,
          context: `Interview for ${template.name} position`,
          includeAudio: true,
        }),
      });

      const data = await response.json();

      if (data.success && data.questions) {
        setInterviewQuestions(data.questions);

        // Update session with total question count
        await updateQuestionCount(
          sessionResult.session.id,
          data.questions.length,
          0
        );

        // Create conversation record for the first question
        if (data.questions[0]) {
          const questionData = data.questions[0];
          const conversationData = {
            session_id: sessionResult.session.id,
            question_number: 1,
            question_text: questionData.text,
            question_category: questionData.category || "general",
            question_difficulty: normalizeDifficulty(questionData.difficulty),
          };

          console.log("Creating conversation with data:", conversationData);
          const conversationResult = await createConversation(conversationData);

          if (conversationResult.success) {
            setCurrentConversation(conversationResult.conversation);
          }

          const firstQuestion = {
            text: questionData.text,
            audio: questionData.audio || null,
            lipsync: questionData.lipsync || null,
            facialExpression: questionData.facialExpression || "default",
            animation: questionData.animation || "Talking_2",
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
    console.log(
      "Chat function entry - message:",
      message,
      "isProcessingQuestion:",
      isProcessingQuestion
    );

    // Allow messages during preparation phase (early answers) or when waiting for answer
    const shouldBlock =
      !message?.trim() || (isProcessingQuestion && !preparationPhase);

    if (shouldBlock) {
      console.log("Chat function blocked - reason:", {
        noMessage: !message?.trim(),
        isProcessing: isProcessingQuestion,
        inPreparation: preparationPhase,
        messageValue: message,
      });
      return;
    }

    console.log("Chat function proceeding with message:", message);

    // If user starts speaking during preparation phase, end it early
    if (preparationPhase) {
      if (preparationTimeout) {
        clearTimeout(preparationTimeout);
        setPreparationTimeout(null);
      }
      endPreparationPhase();
    }

    // Set user as speaking and store the answer
    setIsUserSpeaking(true);
    setUserAnswer(message);
    setIsProcessingQuestion(true); // Prevent timeout from interfering

    // Record the time taken to answer (convert to integer as backend expects)
    const timeTaken = answerStartTime
      ? Math.round((Date.now() - answerStartTime) / 1000)
      : 30;

    // Submit the answer to the backend if we have a current conversation
    if (currentConversation && currentSession) {
      try {
        const normalizedAnswer = normalizeUserAnswer(message);
        console.log("Raw message:", message);
        console.log("Normalized answer:", normalizedAnswer);
        console.log("Message type:", typeof message);
        console.log("Message length:", message?.length);

        const answerPayload = {
          user_answer: normalizedAnswer,
          time_taken_seconds: timeTaken,
        };

        console.log("Submitting answer payload:", answerPayload);

        await submitAnswer(currentConversation.id, answerPayload);

        // Update session progress
        await updateQuestionCount(
          currentSession.id,
          interviewQuestions.length,
          currentQuestionIndex + 1
        );

        // Create performance record
        await createPerformanceRecord({
          session_id: currentSession.id,
          conversation_id: currentConversation.id,
          metric_type: "response_time",
          metric_value: timeTaken,
          metric_max_value: 120.0,
          metric_unit: "seconds",
          performance_category: "efficiency",
          feedback_notes:
            timeTaken < 30
              ? "Quick response"
              : timeTaken < 60
              ? "Good response time"
              : "Consider being more concise",
        });
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }

    // Move to next question
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
    setIsProcessingQuestion(false); // ✅ Allow user to answer
    setAnswerStartTime(Date.now()); // Record when the user can start answering

    // No automatic timeout - user controls when to send answer
  };

  // Removed automatic speaking timer - user controls when to send answer

  // Removed handleSpeakingTimeout - no automatic timeout needed

  const skipCurrentQuestion = async () => {
    // Allow users to manually skip a question
    if (currentConversation && currentSession && !isProcessingQuestion) {
      try {
        setIsProcessingQuestion(true);
        const timeTaken = answerStartTime
          ? Math.round((Date.now() - answerStartTime) / 1000)
          : 0;

        await submitAnswer(currentConversation.id, {
          user_answer: normalizeUserAnswer(""), // Will return "No answer provided"
          time_taken_seconds: timeTaken,
        });

        // Update session progress
        await updateQuestionCount(
          currentSession.id,
          interviewQuestions.length,
          currentQuestionIndex + 1
        );

        // Create performance record for skipped question
        await createPerformanceRecord({
          session_id: currentSession.id,
          conversation_id: currentConversation.id,
          metric_type: "response_time",
          metric_value: timeTaken,
          metric_max_value: 120.0,
          metric_unit: "seconds",
          performance_category: "engagement",
          feedback_notes: "Question was intentionally skipped by user",
          improvement_suggestions:
            "Consider attempting to answer even if uncertain",
        });
      } catch (error) {
        console.error("Error skipping question:", error);
      }
    }

    // Move to next question
    await moveToNextQuestion();
  };

  const moveToNextQuestion = async () => {
    try {
      setLoading(true);

      // Move to next question if we have more
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setTimeout(async () => {
          const nextQuestionIndex = currentQuestionIndex + 1;
          const nextQuestion = interviewQuestions[nextQuestionIndex];

          // Create conversation record for the next question
          if (currentSession) {
            try {
              const conversationResult = await createConversation({
                session_id: currentSession.id,
                question_number: nextQuestionIndex + 1,
                question_text: nextQuestion.text,
                question_category: nextQuestion.category || "general",
                question_difficulty: normalizeDifficulty(
                  nextQuestion.difficulty
                ),
              });

              if (conversationResult.success) {
                setCurrentConversation(conversationResult.conversation);
              }
            } catch (error) {
              console.error(
                "Error creating conversation for next question:",
                error
              );
            }
          }

          // Use next question directly from backend response (should include audio/lipsync)
          const nextQuestionMessage = {
            text: nextQuestion.text,
            audio: nextQuestion.audio || null,
            lipsync: nextQuestion.lipsync || null,
            facialExpression: nextQuestion.facialExpression || "default",
            animation: nextQuestion.animation || "Talking_1",
          };

          setMessages((prevMessages) => [...prevMessages, nextQuestionMessage]);
          setCurrentQuestionIndex(nextQuestionIndex);
          setIsProcessingQuestion(false); // Allow new question to be processed
        }, 2000); // 2 second delay before next question
      } else {
        // Interview completed - end session and show completion
        setTimeout(async () => {
          if (currentSession) {
            try {
              // End the current session
              await endSession(currentSession.id);

              // Create final performance summary
              await createPerformanceRecord({
                session_id: currentSession.id,
                conversation_id: null,
                metric_type: "interview_completion",
                metric_value: 100.0,
                metric_max_value: 100.0,
                metric_unit: "percentage",
                performance_category: "completion",
                feedback_notes: "Interview completed successfully",
                improvement_suggestions:
                  "Great job completing the full interview!",
              });

              // Fetch session performance data from backend
              console.log("Fetching session performance for session:", currentSession.id);
              const performanceResult = await getSessionPerformance(currentSession.id);
              
              if (performanceResult.success) {
                console.log("Session performance fetched:", performanceResult.performance);
                setSessionPerformance(performanceResult.performance);
              } else {
                console.error("Failed to fetch session performance:", performanceResult.message);
              }
            } catch (error) {
              console.error("Error ending session:", error);
            }
          }

          const completionMessage = {
            text: "That concludes our interview! Thank you for your time. You did great! Your performance has been recorded and you can view it in your dashboard.",
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
    };
  }, [preparationTimeout]);

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
        skipCurrentQuestion,
        sessionPerformance,
        currentSession,
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
