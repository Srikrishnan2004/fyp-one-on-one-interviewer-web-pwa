import React from "react";
import { useChat } from "../hooks/useChat";

export const InterviewPerformance = () => {
  const { sessionPerformance, currentSession } = useChat();

  if (!sessionPerformance) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Interview Performance Report
        </h2>
        <p className="text-gray-600">Session ID: {currentSession?.id}</p>
        <p className="text-gray-600">
          Completed: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Overall Performance Summary */}
      {sessionPerformance.summary && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Overall Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessionPerformance.summary.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {metric.metric_type?.replace(/_/g, " ")}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {metric.avg_score
                      ? Number(metric.avg_score).toFixed(1)
                      : "0.0"}
                    {metric.metric_type === "response_time" ? "s" : "%"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          metric.metric_type === "response_time"
                            ? metric.avg_score
                              ? (Number(metric.avg_score) / 120) * 100
                              : 0
                            : metric.avg_score
                            ? Number(metric.avg_score)
                            : 0
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {metric.total_records} records
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Performance Metrics */}
      {sessionPerformance.metrics && sessionPerformance.metrics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Detailed Performance Metrics
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessionPerformance.metrics.map((metric, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      Q{metric.question_number || index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {metric.question_category || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          metric.question_difficulty === "easy"
                            ? "bg-green-100 text-green-800"
                            : metric.question_difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {metric.question_difficulty || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {metric.metric_type === "response_time"
                        ? `${metric.metric_value || 0}s`
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {metric.metric_type !== "response_time"
                        ? `${metric.metric_value || 0}%`
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <p className="text-xs text-gray-600 mb-1">
                          {metric.feedback_notes || "No feedback available"}
                        </p>
                        {metric.improvement_suggestions && (
                          <p className="text-xs text-blue-600">
                            💡 {metric.improvement_suggestions}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conversations/Answers */}
      {sessionPerformance.conversations &&
        sessionPerformance.conversations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Question & Answer Review
            </h3>
            <div className="space-y-4">
              {sessionPerformance.conversations.map((conversation, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Question {conversation.question_number || index + 1}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          conversation.question_difficulty === "easy"
                            ? "bg-green-100 text-green-800"
                            : conversation.question_difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {conversation.question_difficulty || "N/A"}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium mb-2">
                      {conversation.question_text}
                    </p>
                    <p className="text-sm text-gray-600">
                      Category: {conversation.question_category || "General"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Your Answer:
                    </p>
                    <p className="text-gray-800">
                      {conversation.user_answer || "No answer provided"}
                    </p>
                    {conversation.time_taken_seconds && (
                      <p className="text-xs text-gray-500 mt-1">
                        Response time: {conversation.time_taken_seconds}s
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Print Report
        </button>
      </div>
    </div>
  );
};
