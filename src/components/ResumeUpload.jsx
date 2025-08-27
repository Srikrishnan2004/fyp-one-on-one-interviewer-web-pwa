import { useState, useRef } from "react";

export const ResumeUpload = ({ onResumeAnalyzed, template }) => {
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTextarea, setShowTextarea] = useState(false);
  const fileInputRef = useRef();

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setResumeText(text);
      setShowTextarea(true);
    };
    reader.readAsText(file);
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${backendUrl}/interview/resume/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeContent: resumeText,
          template: template.key,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create a modified template with resume questions
        const resumeTemplate = {
          ...template,
          name: `${template.name} (Resume-Based)`,
          questions: data.questions,
          resumeAnalyzed: true,
        };

        onResumeAnalyzed(resumeTemplate);
      } else {
        alert("Failed to analyze resume. Please try again.");
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert(
        "Error analyzing resume. Please check your connection and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!template.category === "resume") {
    return null;
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 mb-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">📄</span>
        <div>
          <h3 className="text-xl font-bold text-white">Resume Analysis</h3>
          <p className="text-sm text-blue-200">
            Upload your resume for personalized interview questions
          </p>
        </div>
      </div>

      {!showTextarea ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              Upload Resume (TXT)
            </button>

            <button
              onClick={() => setShowTextarea(true)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              Paste Resume Text
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          <p className="text-xs text-blue-300 text-center">
            💡 Resume analysis helps generate personalized questions based on
            your experience
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            className="w-full h-40 px-4 py-3 bg-white bg-opacity-20 backdrop-blur-md text-white placeholder-blue-200 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />

          <div className="flex gap-3">
            <button
              onClick={analyzeResume}
              disabled={!resumeText.trim() || isAnalyzing}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !resumeText.trim() || isAnalyzing
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
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
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                  Analyze Resume
                </>
              )}
            </button>

            <button
              onClick={() => {
                setShowTextarea(false);
                setResumeText("");
              }}
              className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
