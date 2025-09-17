import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const { token } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);

  const createSession = async (sessionData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentSession(data.data.session);
        return { success: true, session: data.data.session };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Session creation error:", error);
      return { success: false, message: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sessions/${sessionId}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error starting session:", error);
      return false;
    }
  };

  const endSession = async (sessionId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sessions/${sessionId}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setCurrentSession(null);
        // Refresh session history
        await fetchSessionHistory();
      }

      return data.success;
    } catch (error) {
      console.error("Error ending session:", error);
      return false;
    }
  };

  const pauseSession = async (sessionId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sessions/${sessionId}/pause`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error pausing session:", error);
      return false;
    }
  };

  const resumeSession = async (sessionId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sessions/${sessionId}/resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error resuming session:", error);
      return false;
    }
  };

  const updateQuestionCount = async (
    sessionId,
    totalQuestions,
    completedQuestions
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sessions/${sessionId}/question-count`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            total_questions: totalQuestions,
            completed_questions: completedQuestions,
          }),
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error updating question count:", error);
      return false;
    }
  };

  const fetchSessionHistory = async (options = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (options.status) queryParams.append("status", options.status);
      if (options.limit) queryParams.append("limit", options.limit.toString());
      if (options.offset)
        queryParams.append("offset", options.offset.toString());

      const response = await fetch(`${API_BASE_URL}/sessions?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSessionHistory(data.data.sessions || []);
        return { success: true, sessions: data.data.sessions };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error fetching session history:", error);
      return { success: false, message: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const getSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, session: data.data.session };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const getSessionSummary = async (days = 30) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sessions/summary?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        return { success: true, summary: data.data.summary };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error fetching session summary:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const createConversation = async (conversationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(conversationData),
      });

      const data = await response.json();

      if (data.success) {
        const newConversation = data.data.conversation;
        setConversations((prev) => [...prev, newConversation]);
        return { success: true, conversation: newConversation };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const submitAnswer = async (conversationId, answerData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/answer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(answerData),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update the conversation in state
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  ...answerData,
                  answered_at: new Date().toISOString(),
                }
              : conv
          )
        );
        return { success: true, conversation: data.data.conversation };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const getSessionConversations = async (sessionId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setConversations(data.data.conversations || []);
        return { success: true, conversations: data.data.conversations };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const createPerformanceRecord = async (performanceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/performance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(performanceData),
      });

      const data = await response.json();

      if (data.success) {
        const newRecord = data.data.performance;
        setPerformanceMetrics((prev) => [...prev, newRecord]);
        return { success: true, performance: newRecord };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error creating performance record:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const getPerformanceSummary = async (days = 30) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/performance/summary?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        return { success: true, summary: data.data.summary };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error fetching performance summary:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const value = {
    currentSession,
    sessionHistory,
    conversations,
    performanceMetrics,
    loading,
    createSession,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateQuestionCount,
    fetchSessionHistory,
    getSession,
    getSessionSummary,
    createConversation,
    submitAnswer,
    getSessionConversations,
    createPerformanceRecord,
    getPerformanceSummary,
    setCurrentSession,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
