import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Bot,
  Upload,
  FileText,
  Target,
  CheckCircle,
  Sparkles,
  Download,
  Copy,
  AlertCircle,
  RefreshCw,
  File,
  Check,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const AIInsightsModal = ({ job, isOpen, onClose }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    resumeTips: null,
    jobMatching: null,
    successPrediction: null,
  });
  const [activeTab, setActiveTab] = useState("upload");
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    if (isOpen && job && !jobAnalysis) {
      analyzeJobDescription();
    }
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setResumeFile(file);
        setActiveTab("tips");
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setResumeFile(file);
        setActiveTab("tips");
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const analyzeJobDescription = async () => {
    try {
      const response = await axios.get(`/ai-insights/analyze-job/${job._id}`);
      if (response.data.success) {
        setJobAnalysis(response.data.data.analysis);
        return response.data.data.analysis;
      } else {
        throw new Error(response.data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Job analysis error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to analyze job description";
      toast.error(`Job analysis failed: ${errorMessage}`);
      return null;
    }
  };

  const analyzeWithAI = async (analysisType) => {
    if (!resumeFile) {
      toast.error("Please upload your resume first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobId", job._id);
      formData.append("analysisType", analysisType);

      const response = await axios.post(
        "/ai-insights/analyze-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        setAnalysisResults((prev) => ({
          ...prev,
          [analysisType]: response.data.data.result,
        }));
        toast.success(
          `${getAnalysisTypeLabel(analysisType)} completed successfully!`,
        );
      } else {
        throw new Error(response.data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      let errorMessage = "Analysis failed. Please try again.";
      if (error.message.includes("File size too large")) {
        errorMessage =
          "File size too large. Please upload a file smaller than 10MB.";
      } else if (error.message.includes("Invalid file type")) {
        errorMessage =
          "Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.";
      } else if (error.message.includes("Could not extract text")) {
        errorMessage =
          "Could not extract text from resume. Please try a different file.";
      } else if (error.message.includes("Authentication required")) {
        errorMessage = "Please log in to continue.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisTypeLabel = (type) => {
    const labels = {
      resumeTips: "Resume Tips Analysis",
      jobMatching: "Job Matching Analysis",
      successPrediction: "Success Prediction",
    };
    return labels[type] || type;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setAnalysisResults({
      resumeTips: null,
      jobMatching: null,
      successPrediction: null,
    });
    setActiveTab("upload");
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-gradient-to-r from-purple-50 to-indigo-50",
          border: "border-purple-200",
          icon: "bg-purple-100 text-purple-600",
          text: "text-purple-800",
          subtext: "text-purple-700",
          badge: "bg-purple-100 text-purple-800",
        };
      case "medium":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
          border: "border-blue-200",
          icon: "bg-blue-100 text-blue-600",
          text: "text-blue-800",
          subtext: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-green-50",
          border: "border-emerald-200",
          icon: "bg-emerald-100 text-emerald-600",
          text: "text-emerald-800",
          subtext: "text-emerald-700",
          badge: "bg-emerald-100 text-emerald-800",
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] sm:max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-3 sm:p-4 lg:p-6 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
              <div className="bg-white/20 backdrop-blur-sm w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-1">
                  AI Career Insights
                </h3>
                <div className="text-blue-100 text-xs sm:text-sm">
                  <div className="font-semibold truncate">{job.title}</div>
                  <div className="text-blue-200 text-xs truncate">
                    {job.company}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 cursor-pointer hover:bg-white/20 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
              title="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>

          {/* Enhanced Tabs - Responsive */}
          <div className="flex gap-1 mt-3 sm:mt-4 lg:mt-6 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-1">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 px-1 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 cursor-pointer font-medium rounded-md sm:rounded-lg transition-all duration-300 text-xs sm:text-sm ${
                activeTab === "upload"
                  ? "bg-white text-purple-700 shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0 sm:mr-1 lg:mr-2" />
              <span className="hidden xs:inline sm:hidden">Upload</span>
              <span className="xs:hidden sm:inline">Upload</span>
            </button>
            <button
              onClick={() => setActiveTab("tips")}
              disabled={!resumeFile}
              className={`flex-1 px-1 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 font-medium rounded-md sm:rounded-lg transition-all duration-300 text-xs sm:text-sm ${
                activeTab === "tips"
                  ? "bg-white text-purple-700 shadow-lg"
                  : resumeFile
                    ? "text-white/80 cursor-pointer hover:text-white hover:bg-white/10"
                    : "text-white/40 cursor-not-allowed"
              }`}
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0 sm:mr-1 lg:mr-2" />
              <span className="hidden xs:inline sm:hidden">Tips</span>
              <span className="xs:hidden sm:inline">Tips</span>
            </button>
            <button
              onClick={() => setActiveTab("matching")}
              disabled={!resumeFile}
              className={`flex-1 px-1 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 font-medium rounded-md sm:rounded-lg transition-all duration-300 text-xs sm:text-sm ${
                activeTab === "matching"
                  ? "bg-white text-purple-700 shadow-lg"
                  : resumeFile
                    ? "text-white/80 cursor-pointer hover:text-white hover:bg-white/10"
                    : "text-white/40 cursor-not-allowed"
              }`}
            >
              <Target className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0 sm:mr-1 lg:mr-2" />
              <span className="hidden xs:inline sm:hidden">Match</span>
              <span className="xs:hidden sm:inline">Match</span>
            </button>
            <button
              onClick={() => setActiveTab("prediction")}
              disabled={!resumeFile}
              className={`flex-1 px-1 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 font-medium rounded-md sm:rounded-lg transition-all duration-300 text-xs sm:text-sm ${
                activeTab === "prediction"
                  ? "bg-white text-purple-700 shadow-lg"
                  : resumeFile
                    ? "text-white/80 cursor-pointer hover:text-white hover:bg-white/10"
                    : "text-white/40 cursor-not-allowed"
              }`}
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0 sm:mr-1 lg:mr-2" />
              <span className="hidden xs:inline sm:hidden">Predict</span>
              <span className="xs:hidden sm:inline">Predict</span>
            </button>
          </div>
        </div>

        {/* Content with Custom Scrollbar */}
        <div className="p-3 sm:p-4 lg:p-6 max-h-[calc(95vh-140px)] sm:max-h-[calc(95vh-160px)] lg:max-h-[calc(95vh-200px)] overflow-y-auto custom-scrollbar">
          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-4 sm:space-y-6">
              {!resumeFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-600" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">
                    Upload Your Resume
                  </h4>
                  <p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg">
                    Drag and drop your resume here, or click to browse
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 bg-slate-100 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 inline-block">
                    Supports: PDF, DOC, DOCX, and TXT files (max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="bg-emerald-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                        <File className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-emerald-800 text-sm sm:text-base lg:text-lg truncate">
                          {resumeFile.name}
                        </h4>
                        <p className="text-emerald-600 text-xs sm:text-sm">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB •
                          Ready for AI analysis
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeResume}
                      className="p-1.5 sm:p-2 hover:bg-emerald-100 cursor-pointer rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
                      title="Remove resume"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    </button>
                  </div>
                </div>
              )}

              {resumeFile && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-purple-800 text-sm sm:text-base lg:text-lg">
                      Ready for AI Analysis!
                    </h4>
                  </div>
                  <p className="text-purple-700 mb-4 sm:mb-6 text-sm sm:text-base">
                    Your resume has been uploaded successfully. Choose an
                    analysis type to get AI-powered insights:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <button
                      onClick={() => setActiveTab("tips")}
                      className="group p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer text-left transform hover:scale-105"
                    >
                      <div className="bg-blue-100 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <p className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">
                        Resume Tips
                      </p>
                      <p className="text-xs text-slate-600">
                        Get optimization suggestions
                      </p>
                    </button>
                    <button
                      onClick={() => setActiveTab("matching")}
                      className="group p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-105 cursor-pointer"
                    >
                      <div className="bg-yellow-100 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-yellow-200 transition-colors">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      </div>
                      <p className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">
                        Job Matching
                      </p>
                      <p className="text-xs text-slate-600">
                        See skill alignment
                      </p>
                    </button>
                    <button
                      onClick={() => setActiveTab("prediction")}
                      className="group p-3 sm:p-4 bg-white cursor-pointer rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-105 sm:col-span-2 lg:col-span-1"
                    >
                      <div className="bg-green-100 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-green-200 transition-colors">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <p className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">
                        Success Prediction
                      </p>
                      <p className="text-xs text-slate-600">
                        Get probability scores
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resume Tips Tab */}
          {activeTab === "tips" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">
                    Resume Optimization Tips
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base">
                    AI-powered suggestions to improve your resume for this
                    position
                  </p>
                </div>
                <button
                  onClick={() => analyzeWithAI("resumeTips")}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-sm sm:text-base whitespace-nowrap"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>

              {analysisResults.resumeTips ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Overall Score */}
                  {analysisResults.resumeTips.overallScore && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-lg">
                      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-3 sm:mb-4 shadow-lg">
                        <span className="text-xl sm:text-2xl font-bold text-white">
                          {analysisResults.resumeTips.overallScore}%
                        </span>
                      </div>
                      <h5 className="font-bold text-blue-800 mb-2 text-base sm:text-lg">
                        Resume Score
                      </h5>
                      {analysisResults.resumeTips.summary && (
                        <p className="text-blue-700 text-sm sm:text-base">
                          {analysisResults.resumeTips.summary}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Enhanced Tips */}
                  <div className="space-y-3 sm:space-y-4">
                    {analysisResults.resumeTips.tips?.map((tip, index) => {
                      const style = getPriorityStyle(tip.priority);
                      return (
                        <div
                          key={index}
                          className={`${style.bg} ${style.border} border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div
                              className={`${style.icon} rounded-lg sm:rounded-xl p-1.5 sm:p-2 mt-1 flex-shrink-0`}
                            >
                              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                                <span
                                  className={`${style.badge} text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase tracking-wide`}
                                >
                                  {tip.priority} • {tip.category}
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(tip.suggestion)
                                  }
                                  className="p-1.5 sm:p-2 cursor-pointer hover:bg-white/50 rounded-lg transition-colors self-start sm:self-center"
                                  title="Copy suggestion"
                                >
                                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                                </button>
                              </div>
                              <h6
                                className={`${style.text} font-semibold mb-2 text-sm sm:text-base lg:text-lg`}
                              >
                                {tip.suggestion}
                              </h6>
                              {tip.explanation && (
                                <p
                                  className={`${style.subtext} text-xs sm:text-sm leading-relaxed`}
                                >
                                  {tip.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 text-slate-500">
                  <div className="bg-slate-100 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
                  </div>
                  <p className="text-base sm:text-lg font-medium">
                    Click "Analyze Resume" to get personalized tips
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Job Matching Tab */}
          {activeTab === "matching" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">
                    Job Skills Matching
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Analyze how well your skills align with job requirements
                  </p>
                </div>
                <button
                  onClick={() => analyzeWithAI("jobMatching")}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r cursor-pointer from-yellow-500 to-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-sm sm:text-base whitespace-nowrap"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Analyze Match
                    </>
                  )}
                </button>
              </div>

              {analysisResults.jobMatching ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Match Score */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-3 sm:mb-4 shadow-lg">
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                          {analysisResults.jobMatching.overallMatch}%
                        </span>
                      </div>
                      <h5 className="text-lg sm:text-xl font-bold text-yellow-800 mb-2">
                        Overall Match Score
                      </h5>
                      <p className="text-yellow-700 text-sm sm:text-base lg:text-lg">
                        {analysisResults.jobMatching.overallMatch >= 80
                          ? "🎉 Excellent match!"
                          : analysisResults.jobMatching.overallMatch >= 60
                            ? "👍 Good match with room for improvement"
                            : "💪 Consider improving your skills for better alignment"}
                      </p>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        </div>
                        <h5 className="font-bold text-emerald-800 text-sm sm:text-base lg:text-lg">
                          Matched Skills
                        </h5>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {analysisResults.jobMatching.skillsMatch?.matchedSkills?.map(
                          (skill, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 sm:gap-3 bg-white/70 rounded-lg p-2 sm:p-3"
                            >
                              <div className="bg-emerald-100 p-1 rounded flex-shrink-0">
                                <Check className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-600" />
                              </div>
                              <span className="text-emerald-800 font-medium text-xs sm:text-sm">
                                {skill}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <h5 className="font-bold text-blue-800 text-sm sm:text-base lg:text-lg">
                          Skills to Develop
                        </h5>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {analysisResults.jobMatching.skillsMatch?.missingSkills?.map(
                          (skill, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 sm:gap-3 bg-white/70 rounded-lg p-2 sm:p-3"
                            >
                              <div className="bg-blue-100 p-1 rounded flex-shrink-0">
                                <Target className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                              </div>
                              <span className="text-blue-800 font-medium text-xs sm:text-sm">
                                {skill}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Experience Match */}
                  {analysisResults.jobMatching.experienceMatch && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                        <h5 className="font-bold text-purple-800 text-sm sm:text-base lg:text-lg">
                          Experience Analysis
                        </h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-white/70 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-purple-600 mb-1">
                            Experience Score
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-purple-800">
                            {analysisResults.jobMatching.experienceMatch.score}%
                          </p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-purple-600 mb-1">
                            Level Match
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-purple-800 capitalize">
                            {
                              analysisResults.jobMatching.experienceMatch
                                .levelMatch
                            }
                          </p>
                        </div>
                      </div>
                      {analysisResults.jobMatching.experienceMatch
                        .relevantExperience && (
                        <p className="text-purple-700 mt-3 sm:mt-4 bg-white/70 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
                          {
                            analysisResults.jobMatching.experienceMatch
                              .relevantExperience
                          }
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResults.jobMatching.recommendations && (
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-cyan-100 p-1.5 sm:p-2 rounded-lg">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                        </div>
                        <h5 className="font-bold text-cyan-800 text-sm sm:text-base lg:text-lg">
                          Recommendations
                        </h5>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {analysisResults.jobMatching.recommendations.map(
                          (rec, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 sm:gap-3 bg-white/70 rounded-lg p-3 sm:p-4"
                            >
                              <div className="bg-cyan-100 p-1 rounded mt-1 flex-shrink-0">
                                <Target className="w-2 h-2 sm:w-3 sm:h-3 text-cyan-600" />
                              </div>
                              <span className="text-cyan-800 font-medium text-xs sm:text-sm">
                                {rec}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 text-slate-500">
                  <div className="bg-slate-100 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Target className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
                  </div>
                  <p className="text-base sm:text-lg font-medium">
                    Click "Analyze Match" to see skill alignment
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success Prediction Tab */}
          {activeTab === "prediction" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">
                    Success Prediction
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base">
                    AI-calculated probability of application success
                  </p>
                </div>
                <button
                  onClick={() => analyzeWithAI("successPrediction")}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r cursor-pointer from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-sm sm:text-base whitespace-nowrap"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Calculate Score
                    </>
                  )}
                </button>
              </div>

              {analysisResults.successPrediction ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Success Score */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-3 sm:mb-4 shadow-lg">
                        <span className="text-3xl sm:text-4xl font-bold text-white">
                          {analysisResults.successPrediction.successScore}%
                        </span>
                      </div>
                      <h5 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
                        Success Probability
                      </h5>
                      <p className="text-green-700 text-sm sm:text-base lg:text-lg mb-2">
                        {analysisResults.successPrediction.successScore >= 80
                          ? "🚀 High chance of success!"
                          : analysisResults.successPrediction.successScore >= 60
                            ? "✨ Good prospects with improvements"
                            : "💡 Consider enhancing your profile"}
                      </p>
                      {analysisResults.successPrediction.confidence && (
                        <p className="text-xs sm:text-sm text-green-600 bg-white/70 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 inline-block">
                          Confidence:{" "}
                          {analysisResults.successPrediction.confidence}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Factors Breakdown */}
                  {analysisResults.successPrediction.factors && (
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="bg-slate-100 p-1.5 sm:p-2 rounded-lg">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                        </div>
                        <h5 className="font-bold text-slate-800 text-sm sm:text-base lg:text-lg">
                          Success Factors
                        </h5>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {Object.entries(
                          analysisResults.successPrediction.factors,
                        ).map(([factor, score]) => (
                          <div
                            key={factor}
                            className="bg-white rounded-lg p-3 sm:p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-700 font-medium capitalize text-xs sm:text-sm">
                                {factor.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="text-base sm:text-lg font-bold text-slate-800">
                                {score}%
                              </span>
                            </div>
                            <div className="w-full h-2 sm:h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  score >= 80
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : score >= 60
                                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                                }`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {analysisResults.successPrediction.insights && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        </div>
                        <h5 className="font-bold text-emerald-800 text-sm sm:text-base lg:text-lg">
                          Key Insights
                        </h5>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {analysisResults.successPrediction.insights.map(
                          (insight, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 sm:gap-3 bg-white/70 rounded-lg p-3 sm:p-4"
                            >
                              <div className="bg-emerald-100 p-1 rounded mt-1 flex-shrink-0">
                                <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-600" />
                              </div>
                              <span className="text-emerald-800 font-medium text-xs sm:text-sm">
                                {insight}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Improvement Areas */}
                  {analysisResults.successPrediction.improvementAreas && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <h5 className="font-bold text-blue-800 text-sm sm:text-base lg:text-lg">
                          Areas for Improvement
                        </h5>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {analysisResults.successPrediction.improvementAreas.map(
                          (area, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 sm:gap-3 bg-white/70 rounded-lg p-3 sm:p-4"
                            >
                              <div className="bg-blue-100 p-1 rounded mt-1 flex-shrink-0">
                                <Target className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                              </div>
                              <span className="text-blue-800 font-medium text-xs sm:text-sm">
                                {area}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Competitive Advantages */}
                  {analysisResults.successPrediction.competitiveAdvantages && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                        <h5 className="font-bold text-purple-800 text-sm sm:text-base lg:text-lg">
                          Your Competitive Advantages
                        </h5>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {analysisResults.successPrediction.competitiveAdvantages.map(
                          (advantage, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 sm:gap-3 bg-white/70 rounded-lg p-3 sm:p-4"
                            >
                              <div className="bg-purple-100 p-1 rounded mt-1 flex-shrink-0">
                                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-purple-600" />
                              </div>
                              <span className="text-purple-800 font-medium text-xs sm:text-sm">
                                {advantage}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 text-slate-500">
                  <div className="bg-slate-100 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
                  </div>
                  <p className="text-base sm:text-lg font-medium">
                    Click "Calculate Score" to get success prediction
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-center" reverseOrder={true} />

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #3b82f6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #2563eb);
        }
      `}</style>
    </div>
  );
};

export default AIInsightsModal;
