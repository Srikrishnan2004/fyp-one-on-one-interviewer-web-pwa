import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";
import { ResumeUpload } from "../components/ResumeUpload";

const Home = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = templates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(templates);
    }
  }, [searchQuery, templates]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${backendUrl}/interview/templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
        setFilteredTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    if (selectedTemplate) {
      navigate("/interview", { state: { template: selectedTemplate } });
    }
  };

  const handleResumeAnalyzed = (resumeTemplate) => {
    setSelectedTemplate(resumeTemplate);
  };

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});

  const categoryIcons = {
    languages: "🚀",
    frameworks: "⚛️",
    databases: "🗄️",
    resume: "📄",
  };

  const categoryDescriptions = {
    languages: "Programming language fundamentals",
    frameworks: "Web frameworks and libraries",
    databases: "Database design and optimization",
    resume: "Resume-based behavioral and technical questions",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Interview Templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800">
      <PWAInstallPrompt />

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Interviewer 🤖
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Practice with an intelligent AI interviewer using voice interaction
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <input
              type="text"
              placeholder="Search interview templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-md text-white placeholder-blue-200 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Resume Upload for Resume Templates */}
        {selectedTemplate?.category === "resume" && (
          <ResumeUpload
            template={selectedTemplate}
            onResumeAnalyzed={handleResumeAnalyzed}
          />
        )}

        {/* Template Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {Object.entries(groupedTemplates).map(
            ([category, categoryTemplates]) => (
              <div
                key={category}
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20"
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">
                    {categoryIcons[category]}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {category}
                    </h2>
                    <p className="text-sm text-blue-200">
                      {categoryDescriptions[category]}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {categoryTemplates.map((template) => (
                    <div
                      key={template.key}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedTemplate?.key === template.key
                          ? "bg-blue-500 bg-opacity-50 border-2 border-blue-300"
                          : "bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20"
                      }`}
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-blue-200 line-clamp-2">
                        {template.description}
                      </p>
                      {selectedTemplate?.key === template.key && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                            ✓ Selected
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Selected Template Info */}
        {selectedTemplate && (
          <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to start: {selectedTemplate.name}
                </h3>
                <p className="text-blue-200">{selectedTemplate.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-blue-300">
                  <span>📊 Model: {selectedTemplate.model}</span>
                  <span>🏷️ Category: {selectedTemplate.category}</span>
                </div>
              </div>
              <button
                onClick={startInterview}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎤 Start Voice Interview
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {templates.length}
              </div>
              <div className="text-sm text-blue-200">Total Templates</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {Object.keys(groupedTemplates).length}
              </div>
              <div className="text-sm text-blue-200">Categories</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4">
              <div className="text-2xl font-bold text-white">🎤</div>
              <div className="text-sm text-blue-200">Voice Enabled</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4">
              <div className="text-2xl font-bold text-white">🤖</div>
              <div className="text-sm text-blue-200">AI Powered</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Why Choose AI Interviewer?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Voice Interaction
              </h3>
              <p className="text-blue-200">
                Natural conversation with real-time speech recognition and live
                captions
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                AI-Powered
              </h3>
              <p className="text-blue-200">
                Advanced AI generates contextual questions based on your
                responses
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Targeted Practice
              </h3>
              <p className="text-blue-200">
                23+ specialized templates covering languages, frameworks, and
                more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
