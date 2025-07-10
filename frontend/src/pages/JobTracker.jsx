import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Users,
  Star,
  BookOpen,
  Zap,
  Building2,
  Bot,
  Target,
  Sparkles,
  ChevronDown,
  Maximize,
  X,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import FloatingBuyMeCoffeeButton from "../components/FloatingGpayButton";
import JobDetailsModal from "../components/jobTracker/JobDetailsModal";
import EditJobModal from "../components/jobTracker/EditJobModal";
import AddJobModal from "../components/jobTracker/AddJobModal";

const JobTracker = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Kanban columns configuration
  const columns = [
    { id: "applied", title: "Applied", color: "blue", icon: FileText },
    { id: "interview", title: "Interview", color: "yellow", icon: Users },
    { id: "in-progress", title: "In Progress", color: "purple", icon: Timer },
    { id: "offer", title: "Offer", color: "green", icon: CheckCircle },
    { id: "rejected", title: "Rejected", color: "red", icon: XCircle },
  ];

  useEffect(() => {
    // Set up axios defaults
    axios.defaults.baseURL = API_BASE_URL;
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    loadJobs();
  }, []);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/jobs");

      if (response.data.success) {
        setJobs(response.data.data.jobs);
      } else {
        throw new Error(response.data.message || "Failed to load jobs");
      }
    } catch (error) {
      console.error("Failed to load jobs:", error);
      toast.error(error.response?.data?.message || "Failed to load jobs");
      // Fallback to empty array on error
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, job) => {
    setDraggedItem(job);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== newStatus) {
      updateJobStatus(draggedItem._id, newStatus);
    }
    setDraggedItem(null);
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const response = await axios.patch(`/jobs/${jobId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job._id === jobId ? { ...job, status: newStatus } : job
          )
        );
        toast.success("Job status updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update job status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update job status"
      );
    }
  };

  const updateJob = async (jobId, updatedData) => {
    try {
      const response = await axios.put(`/jobs/${jobId}`, updatedData);

      if (response.data.success) {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job._id === jobId ? { ...job, ...response.data.data.job } : job
          )
        );
        toast.success("Job updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update job");
      }
    } catch (error) {
      console.error("Failed to update job:", error);
      toast.error(error.response?.data?.message || "Failed to update job");
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const response = await axios.delete(`/jobs/${jobId}`);

      if (response.data.success) {
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
        toast.success("Job deleted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to delete job");
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
  };

  const addJob = async (jobData) => {
    try {
      const response = await axios.post("/jobs", jobData);

      if (response.data.success) {
        setJobs((prevJobs) => [response.data.data.job, ...prevJobs]);
        toast.success("Job added successfully!");
        setShowAddModal(false);
      } else {
        throw new Error(response.data.message || "Failed to add job");
      }
    } catch (error) {
      console.error("Failed to add job:", error);
      toast.error(error.response?.data?.message || "Failed to add job");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getJobsByStatus = (status) => {
    return filteredJobs.filter((job) => job.status === status);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50/50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50/50";
      case "low":
        return "border-l-green-500 bg-green-50/50";
      default:
        return "border-l-gray-500 bg-gray-50/50";
    }
  };

  const getColumnColor = (color) => {
    const colors = {
      blue: "from-blue-50/80 to-indigo-50/80 border-blue-200/50",
      yellow: "from-yellow-50/80 to-orange-50/80 border-yellow-200/50",
      purple: "from-purple-50/80 to-pink-50/80 border-purple-200/50",
      green: "from-green-50/80 to-emerald-50/80 border-green-200/50",
      red: "from-red-50/80 to-pink-50/80 border-red-200/50",
    };
    return colors[color] || colors.blue;
  };

  const getColumnHeaderColor = (color) => {
    const colors = {
      blue: "bg-blue-600 text-white",
      yellow: "bg-yellow-600 text-white",
      purple: "bg-purple-600 text-white",
      green: "bg-green-600 text-white",
      red: "bg-red-600 text-white",
    };
    return colors[color] || colors.blue;
  };

  // Render the kanban board component
  const renderKanbanBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {columns.map((column) => {
        const columnJobs = getJobsByStatus(column.id);
        const IconComponent = column.icon;
        const hasJobs = columnJobs.length > 0;

        // Dynamic height based on content and device
        const minHeight = hasJobs
          ? isFullscreen
            ? "min-h-[500px]"
            : "min-h-[400px]"
          : isFullscreen
          ? "min-h-[300px]"
          : "min-h-[250px]";
        // Set max height based on screen size and make scrollable after certain number of items
        const maxHeight = isFullscreen ? "max-h-[75vh]" : "max-h-[60vh]";

        return (
          <div
            key={column.id}
            className={`bg-gradient-to-br ${getColumnColor(
              column.color
            )} backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${minHeight} w-full`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Enhanced Column Header - No padding */}
            <div
              className={`${getColumnHeaderColor(
                column.color
              )} px-3 sm:px-4 py-3 sm:py-4 shadow-sm flex-shrink-0`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  <h3 className="font-bold text-sm sm:text-base lg:text-lg truncate">
                    {column.title}
                  </h3>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold">
                    {columnJobs.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Job Cards Container - Optimized for scrolling */}
            <div
              className={`flex-1 ${
                hasJobs ? "p-3 sm:p-4" : "p-2"
              } ${maxHeight} overflow-y-auto custom-scrollbar`}
            >
              {hasJobs ? (
                <div className="space-y-3 sm:space-y-4">
                  {columnJobs.map((job) => (
                    <div
                      key={job._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job)}
                      onClick={() => setSelectedJob(job)}
                      className={`bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${getPriorityColor(
                        job.priority
                      )} group hover:scale-[1.02] hover:-translate-y-1`}
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {/* Job Title & Company */}
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm sm:text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                            {job.title}
                          </h4>
                          <p className="text-slate-600 text-xs sm:text-sm flex items-center mt-1">
                            <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </p>
                        </div>

                        {/* Tags & Priority */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {job.aiSuggestions &&
                              job.aiSuggestions.length > 0 && (
                                <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs flex items-center">
                                  <Bot className="w-3 h-3 mr-1" />
                                  <span className="font-medium">AI</span>
                                </div>
                              )}
                          </div>
                          <div
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-sm ${
                              job.priority === "high"
                                ? "bg-red-500"
                                : job.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Compact Empty State */
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-6 sm:py-8">
                  <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-30" />
                  <p className="text-xs sm:text-sm font-medium text-center px-2">
                    No jobs in {column.title.toLowerCase()}
                  </p>
                  <p className="text-xs mt-1 text-center opacity-75 hidden sm:block px-2">
                    Drag jobs here
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render fullscreen controls (search + fullscreen toggle)
  const renderFullscreenControls = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-white/40">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 w-full sm:max-w-xs md:max-w-md lg:max-w-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 cursor-pointer to-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 hover:from-blue-700 hover:to-indigo-800 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Add</span>
          </button>

          <button
            onClick={() => setIsFullscreen(false)}
            className="bg-slate-600 hover:bg-slate-700 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar current="/jobtracker" />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Loading Job Tracker
              </h3>
              <p className="text-slate-600">
                Organizing your job applications...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Fullscreen Mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-50 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex-shrink-0 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Job Tracker
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Fullscreen Kanban Board
                  </p>
                </div>
              </div>

              {/* Stats Mini Overview */}
              <div className="hidden md:flex items-center space-x-4">
                {columns.map((column) => {
                  const count = getJobsByStatus(column.id).length;
                  const IconComponent = column.icon;
                  return (
                    <div
                      key={column.id}
                      className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2"
                    >
                      <IconComponent
                        className={`w-4 h-4 ${
                          column.color === "blue"
                            ? "text-blue-600"
                            : column.color === "yellow"
                            ? "text-yellow-600"
                            : column.color === "purple"
                            ? "text-purple-600"
                            : column.color === "green"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {renderFullscreenControls()}
          </div>

          {/* Fullscreen Kanban Board */}
          <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="h-full">{renderKanbanBoard()}</div>
          </div>
        </div>

        {/* Modals still work in fullscreen */}
        <JobDetailsModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onEdit={(job) => {
            setSelectedJob(null);
            setEditingJob(job);
          }}
          onDelete={deleteJob}
          onStatusChange={updateJobStatus}
          onSave={(updatedJob) => {
            updateJob(updatedJob._id, updatedJob);
          }}
        />

        <EditJobModal
          job={editingJob}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onSave={(updatedJob) => {
            updateJob(updatedJob._id, updatedJob);
            setEditingJob(null);
          }}
        />

        <AddJobModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={addJob}
        />

        <Toaster position="top-center" reverseOrder={true} />
      </div>
    );
  }

  // Normal Mode
  return (
    <>
      <Navbar current="/jobtracker" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="hidden md:block">
          <FloatingBuyMeCoffeeButton />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12 lg:py-16">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 px-2">
                Job Application Tracker
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2">
                Track your job applications with AI-powered insights and kanban
                board organization
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 -mt-4 sm:-mt-6 lg:-mt-8 relative z-10">
          {/* Enhanced Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/40">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-between">
              {/* Left side - Search */}
              <div className="flex-1 w-full lg:max-w-2xl">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs, companies, or positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 sm:py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 text-sm sm:text-base lg:text-lg"
                  />
                </div>
              </div>

              {/* Right side - Add Job Button & Fullscreen */}
              <div className="flex items-center space-x-3 sm:space-x-4 w-full lg:w-auto">
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="group bg-gradient-to-r from-slate-600 cursor-pointer to-slate-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 hover:from-slate-700 hover:to-slate-800 transform hover:scale-105 hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="group bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 hover:-translate-y-0.5 flex-1 lg:flex-none text-sm sm:text-base lg:text-lg"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add New Job</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {columns.map((column) => {
              const count = getJobsByStatus(column.id).length;
              const IconComponent = column.icon;
              return (
                <div
                  key={column.id}
                  className={`${getColumnHeaderColor(
                    column.color
                  )} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg`}
                >
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mx-auto mb-2 sm:mb-3" />
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                    {count}
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base opacity-90">
                    {column.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kanban Board - Responsive Layout */}
          <div className="mb-6 sm:mb-8 lg:mb-10">{renderKanbanBoard()}</div>

          {/* AI Insights Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8 lg:mb-10">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 sm:space-y-8 lg:space-y-0">
                {/* Left Content */}
                <div className="text-center lg:text-left lg:flex-1">
                  <div className="flex items-center justify-center lg:justify-start mb-4">
                    <div className="bg-white/20 backdrop-blur-sm w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                        AI-Powered Insights
                      </h3>
                      <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
                        Supercharge your job search with intelligent
                        recommendations
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Content - Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:flex-1 lg:max-w-3xl w-full">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                      Resume Tips
                    </h4>
                    <p className="text-purple-100 text-xs sm:text-sm">
                      AI-optimized suggestions
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-200 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                      Job Matching
                    </h4>
                    <p className="text-purple-100 text-xs sm:text-sm">
                      Smart skill analysis
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-200 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                      Success Prediction
                    </h4>
                    <p className="text-purple-100 text-xs sm:text-sm">
                      Probability scoring
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onEdit={(job) => {
          setSelectedJob(null);
          setEditingJob(job);
        }}
        onDelete={deleteJob}
        onStatusChange={updateJobStatus}
        onSave={(updatedJob) => {
          updateJob(updatedJob._id, updatedJob);
        }}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        job={editingJob}
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        onSave={(updatedJob) => {
          updateJob(updatedJob._id, updatedJob);
          setEditingJob(null);
        }}
      />

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addJob}
      />

      <Toaster position="top-center" reverseOrder={true} />

      {/* Custom CSS for scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default JobTracker;
