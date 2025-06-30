  import React, { useState, useEffect } from 'react';
  import {
    Plus, Search, Filter, Briefcase, FileText,
    CheckCircle, XCircle, AlertCircle,
    Timer, Users, Star, BookOpen, Zap, Building2, Bot, Target, Sparkles,
    ChevronDown
  } from 'lucide-react';  
  import axios from 'axios';
  import Navbar from '../components/Navbar';
  import Footer from '../components/Footer';
  import toast, { Toaster } from 'react-hot-toast';
  import FloatingBuyMeCoffeeButton from '../components/FloatingGpayButton';
  import JobDetailsModal from '../components/jobTracker/JobDetailsModal';
  import EditJobModal from '../components/jobTracker/EditJobModal';
  import AddJobModal from '../components/jobTracker/AddJobModal';

  const JobTracker = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [editingJob, setEditingJob] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Kanban columns configuration
    const columns = [
      { id: 'applied', title: 'Applied', color: 'blue', icon: FileText },
      { id: 'interview', title: 'Interview', color: 'yellow', icon: Users },
      { id: 'in-progress', title: 'In Progress', color: 'purple', icon: Timer },
      { id: 'offer', title: 'Offer', color: 'green', icon: CheckCircle },
      { id: 'rejected', title: 'Rejected', color: 'red', icon: XCircle },
    ];

    useEffect(() => {
      // Set up axios defaults
      axios.defaults.baseURL = API_BASE_URL;
      const token = localStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      loadJobs();
    }, []);

    const loadJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/jobs');

        if (response.data.success) {
          setJobs(response.data.data.jobs);
        } else {
          throw new Error(response.data.message || 'Failed to load jobs');
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
        toast.error(error.response?.data?.message || 'Failed to load jobs');
        // Fallback to empty array on error
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    const handleDragStart = (e, job) => {
      setDraggedItem(job);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, newStatus) => {
      e.preventDefault();
      if (draggedItem && draggedItem.status !== newStatus) {
        console.log(draggedItem);

        updateJobStatus(draggedItem._id, newStatus);
      }
      setDraggedItem(null);
    };

    const updateJobStatus = async (jobId, newStatus) => {
      try {
        const response = await axios.patch(`/jobs/${jobId}/status`, {
          status: newStatus
        });

        if (response.data.success) {
          setJobs(prevJobs =>
            prevJobs.map(job =>
              job._id === jobId ? { ...job, status: newStatus } : job
            )
          );
          toast.success('Job status updated successfully!');
        } else {
          throw new Error(response.data.message || 'Failed to update status');
        }
      } catch (error) {
        console.error('Failed to update job status:', error);
        toast.error(error.response?.data?.message || 'Failed to update job status');
      }
    };

    const updateJob = async (jobId, updatedData) => {
      try {
        const response = await axios.put(`/jobs/${jobId}`, updatedData);

        if (response.data.success) {
          setJobs(prevJobs =>
            prevJobs.map(job =>
              job._id === jobId ? { ...job, ...response.data.data.job } : job
            )
          );
          toast.success('Job updated successfully!');
        } else {
          throw new Error(response.data.message || 'Failed to update job');
        }
      } catch (error) {
        console.error('Failed to update job:', error);
        toast.error(error.response?.data?.message || 'Failed to update job');
      }
    };

    const deleteJob = async (jobId) => {
      try {
        const response = await axios.delete(`/jobs/${jobId}`);

        if (response.data.success) {
          setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
          toast.success('Job deleted successfully!');
        } else {
          throw new Error(response.data.message || 'Failed to delete job');
        }
      } catch (error) {
        console.error('Failed to delete job:', error);
        toast.error(error.response?.data?.message || 'Failed to delete job');
      }
    };

    const addJob = async (jobData) => {
      try {
        const response = await axios.post('/jobs', jobData);

        if (response.data.success) {
          setJobs(prevJobs => [response.data.data.job, ...prevJobs]);
          toast.success('Job added successfully!');
          setShowAddModal(false);
        } else {
          throw new Error(response.data.message || 'Failed to add job');
        }
      } catch (error) {
        console.error('Failed to add job:', error);
        toast.error(error.response?.data?.message || 'Failed to add job');
      }
    };

    const filteredJobs = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const getJobsByStatus = (status) => {
      return filteredJobs.filter(job => job.status === status);
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return 'border-l-red-500 bg-red-50/50';
        case 'medium': return 'border-l-yellow-500 bg-yellow-50/50';
        case 'low': return 'border-l-green-500 bg-green-50/50';
        default: return 'border-l-gray-500 bg-gray-50/50';
      }
    };

    const getColumnColor = (color) => {
      const colors = {
        blue: 'from-blue-50/80 to-indigo-50/80 border-blue-200/50',
        yellow: 'from-yellow-50/80 to-orange-50/80 border-yellow-200/50',
        purple: 'from-purple-50/80 to-pink-50/80 border-purple-200/50',
        green: 'from-green-50/80 to-emerald-50/80 border-green-200/50',
        red: 'from-red-50/80 to-pink-50/80 border-red-200/50',
      };
      return colors[color] || colors.blue;
    };

    const getColumnHeaderColor = (color) => {
      const colors = {
        blue: 'bg-blue-600 text-white',
        yellow: 'bg-yellow-600 text-white',
        purple: 'bg-purple-600 text-white',
        green: 'bg-green-600 text-white',
        red: 'bg-red-600 text-white',
      };
      return colors[color] || colors.blue;
    };

    if (loading) {
      return (
        <>
          <Navbar current="/jobtracker" />
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your job applications...</p>
            </div>
          </div>
        </>
      );
    }

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
            <div className="relative max-w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16">
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
                  Track your job applications with AI-powered insights and kanban board organization
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:px-12 -mt-4 sm:-mt-6 lg:-mt-8 relative z-10">
            {/* Enhanced Controls */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-8 border border-white/50">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
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
                      className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 text-lg"
                    />
                  </div>
                </div>

                {/* Right side - Add Job Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="group bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 hover:-translate-y-0.5"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-lg">Add New Job</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Kanban Board - Wide Layout */}
            <div className="mb-8">
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 min-h-[700px]">
                {columns.map((column) => {
                  const columnJobs = getJobsByStatus(column.id);
                  const IconComponent = column.icon;

                  return (
                    <div
                      key={column.id}
                      className={`bg-gradient-to-br ${getColumnColor(column.color)} backdrop-blur-sm rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id)}
                    >
                      {/* Enhanced Column Header */}
                      <div className={`${getColumnHeaderColor(column.color)} px-6 py-4 shadow-sm`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5" />
                            <h3 className="font-bold text-lg">{column.title}</h3>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-sm font-bold">{columnJobs.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Job Cards Container */}
                      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {columnJobs.map((job) => (
                          <div
                            key={job._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, job)}
                            onClick={() => setSelectedJob(job)}
                            className={`bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${getPriorityColor(job.priority)} group hover:scale-[1.02] hover:-translate-y-1`}
                          >
                            <div className="space-y-3">
                              {/* Job Title & Company */}
                              <div>
                                <h4 className="font-semibold text-slate-800 text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {job.title}
                                </h4>
                                <p className="text-slate-600 text-sm flex items-center mt-1">
                                  <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">{job.company}</span>
                                </p>
                              </div>

                              {/* Tags & Priority */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {job.aiSuggestions && job.aiSuggestions.length > 0 && (
                                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs flex items-center">
                                      <Bot className="w-3 h-3 mr-1" />
                                      <span className="font-medium">AI</span>
                                    </div>
                                  )}
                                </div>
                                <div className={`w-3 h-3 rounded-full shadow-sm ${
                                  job.priority === 'high' ? 'bg-red-500' :
                                  job.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Enhanced Empty State */}
                        {columnJobs.length === 0 && (
                          <div className="text-center py-12 text-slate-400">
                            <IconComponent className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No jobs in {column.title.toLowerCase()}</p>
                            <p className="text-xs mt-1">Drag jobs here or add new ones</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Insights Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 rounded-2xl shadow-2xl mb-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative px-8 py-12">
                <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0">
                  {/* Left Content */}
                  <div className="text-center lg:text-left lg:flex-1">
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                      <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mr-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">AI-Powered Insights</h3>
                        <p className="text-purple-100 text-lg">Supercharge your job search with intelligent recommendations</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - Feature Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:flex-1 lg:max-w-3xl">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <BookOpen className="w-8 h-8 text-blue-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-semibold text-white mb-2">Resume Tips</h4>
                      <p className="text-purple-100 text-sm">AI-optimized suggestions</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <Zap className="w-8 h-8 text-yellow-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-semibold text-white mb-2">Job Matching</h4>
                      <p className="text-purple-100 text-sm">Smart skill analysis</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <Target className="w-8 h-8 text-green-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-semibold text-white mb-2">Success Prediction</h4>
                      <p className="text-purple-100 text-sm">Probability scoring</p>
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

        <Toaster
          position="top-center"
          reverseOrder={true}
        />

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