import { useState, useEffect } from "react";
import { useSession } from "../contexts/SessionContext";

export const InterviewSummary = ({ sessionId, onClose, onViewDashboard }) => {
  const { getSession, getSessionConversations, getPerformanceSummary } =
    useSession();
  const [sessionData, setSessionData] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadSummaryData();
    }
  }, [sessionId]);

  const loadSummaryData = async () => {
    try {
      setLoading(true);

      const [sessionResult, conversationsResult, performanceResult] =
        await Promise.all([
          getSession(sessionId),
          getSessionConversations(sessionId),
          getPerformanceSummary(1), // Last 1 day to get recent performance
        ]);

      if (sessionResult.success) {
        setSessionData(sessionResult.session);
      }

      if (conversationsResult.success) {
        setConversations(conversationsResult.conversations);
      }

      if (performanceResult.success) {
        setPerformance(performanceResult.summary);
      }
    } catch (error) {
      console.error("Error loading summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSessionDuration = () => {
    if (!sessionData?.started_at || !sessionData?.ended_at) return "Unknown";

    const start = new Date(sessionData.started_at);
    const end = new Date(sessionData.ended_at);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const getAnsweredQuestions = () => {
    return conversations.filter(
      (conv) => conv.user_answer && conv.user_answer.trim() !== ""
    ).length;
  };

  const getAverageResponseTime = () => {
    const answeredConversations = conversations.filter(
      (conv) => conv.time_taken_seconds
    );
    if (answeredConversations.length === 0) return 0;

    const totalTime = answeredConversations.reduce(
      (sum, conv) => sum + conv.time_taken_seconds,
      0
    );
    return (totalTime / answeredConversations.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading interview summary...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              🎉 Interview Complete!
            </h2>
            <p className="text-gray-600">
              Great job! Here's your performance summary.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Session Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Session Overview
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {sessionData?.total_questions || 0}
                </div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getAnsweredQuestions()}
                </div>
                <div className="text-sm text-gray-600">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {calculateSessionDuration()}
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {getAverageResponseTime()}s
                </div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {performance.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performance.slice(0, 6).map((metric, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700 capitalize">
                      {metric.metric_type.replace(/_/g, " ")}
                    </h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {metric.performance_category}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {metric.avg_score?.toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${metric.avg_score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Range: {metric.min_score?.toFixed(1)}% -{" "}
                    {metric.max_score?.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Analysis */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Question Analysis
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {conversations.map((conversation, index) => (
              <div key={conversation.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">
                    Q{conversation.question_number}:{" "}
                    {conversation.question_category}
                  </h4>
                  <div className="flex items-center gap-2">
                    {conversation.time_taken_seconds && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {conversation.time_taken_seconds}s
                      </span>
                    )}
                    {conversation.confidence_score && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          conversation.confidence_score >= 0.8
                            ? "bg-green-100 text-green-800"
                            : conversation.confidence_score >= 0.6
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {(conversation.confidence_score * 100).toFixed(0)}%
                        confident
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {conversation.question_text}
                </p>
                {conversation.user_answer && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">
                      Your answer:{" "}
                    </span>
                    <span className="text-gray-600">
                      {conversation.user_answer.length > 100
                        ? `${conversation.user_answer.substring(0, 100)}...`
                        : conversation.user_answer}
                    </span>
                  </div>
                )}
                {conversation.llm_feedback && (
                  <div className="text-sm mt-2 p-2 bg-blue-50 rounded">
                    <span className="font-medium text-blue-700">
                      Feedback:{" "}
                    </span>
                    <span className="text-blue-600">
                      {conversation.llm_feedback}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onViewDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            📊 View Full Dashboard
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🏠 Back to Home
          </button>
        </div>

        {/* Encouragement Message */}
        <div className="mt-6 text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <p className="text-gray-700">
            🌟 Keep practicing to improve your interview skills! Your
            performance data helps track your progress over time.
          </p>
        </div>
      </div>
    </div>
  );
};
