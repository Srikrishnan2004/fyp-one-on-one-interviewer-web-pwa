import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSession } from "../contexts/SessionContext";

export const UserDashboard = ({ onClose }) => {
  const { user, logout } = useAuth();
  const {
    sessionHistory,
    fetchSessionHistory,
    getSessionSummary,
    getPerformanceSummary,
    loading,
  } = useSession();

  const [activeTab, setActiveTab] = useState("overview");
  const [sessionSummary, setSessionSummary] = useState(null);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, timeRange]);

  const loadDashboardData = async () => {
    await Promise.all([
      fetchSessionHistory({ limit: 20 }),
      loadSessionSummary(),
      loadPerformanceSummary(),
    ]);
  };

  const loadSessionSummary = async () => {
    const result = await getSessionSummary(timeRange);
    if (result.success) {
      setSessionSummary(result.summary);
    }
  };

  const loadPerformanceSummary = async () => {
    const result = await getPerformanceSummary(timeRange);
    if (result.success) {
      setPerformanceSummary(result.summary);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "abandoned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
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
        </div>

        {/* Time Range Selector */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Time Range:
            </span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 3 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "sessions", label: "Sessions" },
              { id: "performance", label: "Performance" },
              { id: "profile", label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && !loading && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Total Sessions
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {sessionSummary?.total_sessions
                      ? Number(sessionSummary.total_sessions)
                      : 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900">
                    Completed
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {sessionSummary?.completed_sessions
                      ? Number(sessionSummary.completed_sessions)
                      : 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900">
                    Avg Duration
                  </h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {sessionSummary?.avg_duration
                      ? `${Math.round(Number(sessionSummary.avg_duration))}min`
                      : "0min"}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900">
                    Questions Answered
                  </h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {sessionSummary?.total_questions_answered
                      ? Number(sessionSummary.total_questions_answered)
                      : 0}
                  </p>
                </div>
              </div>

              {/* Performance Overview */}
              {performanceSummary &&
                (Array.isArray(performanceSummary)
                  ? performanceSummary.length > 0
                  : Object.keys(performanceSummary).length > 0) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Performance Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(Array.isArray(performanceSummary)
                        ? performanceSummary
                        : Object.values(performanceSummary)
                      )
                        .slice(0, 3)
                        .map((metric, index) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded border"
                          >
                            <h4 className="font-medium text-gray-700">
                              {metric.metric_type}
                            </h4>
                            <p className="text-lg font-bold text-blue-600">
                              {metric.avg_score
                                ? Number(metric.avg_score).toFixed(1)
                                : "0.0"}
                              {metric.metric_type === "response_time"
                                ? "s"
                                : "%"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {metric.total_records
                                ? Number(metric.total_records)
                                : 0}{" "}
                              records
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && !loading && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Sessions
              </h3>
              {sessionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No sessions found
                </p>
              ) : (
                <div className="space-y-3">
                  {sessionHistory.map((session) => (
                    <div
                      key={session.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {session.session_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {session.session_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            Started: {formatDate(session.started_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              session.status
                            )}`}
                          >
                            {session.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {session.completed_questions}/
                            {session.total_questions}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && !loading && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Metrics
              </h3>
              {!performanceSummary ||
              (Array.isArray(performanceSummary)
                ? performanceSummary.length === 0
                : Object.keys(performanceSummary).length === 0) ? (
                <p className="text-gray-500 text-center py-8">
                  No performance data available
                </p>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(performanceSummary)
                    ? performanceSummary
                    : Object.values(performanceSummary)
                  ).map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {metric.metric_type}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {metric.performance_category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {metric.avg_score
                              ? Number(metric.avg_score).toFixed(1)
                              : "0.0"}
                            {metric.metric_type === "response_time" ? "s" : "%"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Range:{" "}
                            {metric.min_score
                              ? Number(metric.min_score).toFixed(1)
                              : "0.0"}
                            {metric.metric_type === "response_time" ? "s" : "%"}{" "}
                            -{" "}
                            {metric.max_score
                              ? Number(metric.max_score).toFixed(1)
                              : "0.0"}
                            {metric.metric_type === "response_time" ? "s" : "%"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
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
                                      : 0 // Normalize response time to 120s max
                                    : metric.avg_score
                                    ? Number(metric.avg_score)
                                    : 0
                                )
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && !loading && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <p className="text-gray-900">{user?.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <p className="text-gray-900">{user?.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <p className="text-gray-900">{user?.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Member Since
                    </label>
                    <p className="text-gray-900">
                      {formatDate(user?.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
