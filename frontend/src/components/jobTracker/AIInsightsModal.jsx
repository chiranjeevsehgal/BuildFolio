import React, { useState, useRef, useEffect } from 'react';
import {
    XCircle, Bot, Upload, FileText, Target, CheckCircle,
    Sparkles, Download, Copy, AlertCircle, RefreshCw,
    File, Check, X, TrendingUp, Award, Zap
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const AIInsightsModal = ({ job, isOpen, onClose }) => {
    const [resumeFile, setResumeFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState({
        resumeTips: null,
        jobMatching: null,
        successPrediction: null
    });
    const [activeTab, setActiveTab] = useState('upload');
    const [jobAnalysis, setJobAnalysis] = useState(null);
    const fileInputRef = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL;
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                setResumeFile(file);
                setActiveTab('tips');
                toast.success('Resume uploaded successfully!');
            } else {
                toast.error('Please upload a PDF file');
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
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                setResumeFile(file);
                setActiveTab('tips');
                toast.success('Resume uploaded successfully!');
            } else {
                toast.error('Please upload a PDF file');
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
                throw new Error(response.data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Job analysis error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to analyze job description';
            toast.error(`Job analysis failed: ${errorMessage}`);
            return null;
        }
    };

    const analyzeWithAI = async (analysisType) => {
        if (!resumeFile) {
            toast.error('Please upload your resume first');
            return;
        }

        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('jobId', job._id);
            formData.append('analysisType', analysisType);

            const response = await axios.post('/ai-insights/analyze-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setAnalysisResults(prev => ({
                    ...prev,
                    [analysisType]: response.data.data.result
                }));
                toast.success(`${getAnalysisTypeLabel(analysisType)} completed successfully!`);
            } else {
                throw new Error(response.data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('AI analysis error:', error);
            let errorMessage = 'Analysis failed. Please try again.';
            if (error.message.includes('File size too large')) {
                errorMessage = 'File size too large. Please upload a file smaller than 10MB.';
            } else if (error.message.includes('Invalid file type')) {
                errorMessage = 'Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.';
            } else if (error.message.includes('Could not extract text')) {
                errorMessage = 'Could not extract text from resume. Please try a different file.';
            } else if (error.message.includes('Authentication required')) {
                errorMessage = 'Please log in to continue.';
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
            resumeTips: 'Resume Tips Analysis',
            jobMatching: 'Job Matching Analysis',
            successPrediction: 'Success Prediction'
        };
        return labels[type] || type;
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const removeResume = () => {
        setResumeFile(null);
        setAnalysisResults({
            resumeTips: null,
            jobMatching: null,
            successPrediction: null
        });
        setActiveTab('upload');
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'high':
                return {
                    bg: 'bg-gradient-to-r from-purple-50 to-indigo-50',
                    border: 'border-purple-200',
                    icon: 'bg-purple-100 text-purple-600',
                    text: 'text-purple-800',
                    subtext: 'text-purple-700',
                    badge: 'bg-purple-100 text-purple-800'
                };
            case 'medium':
                return {
                    bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
                    border: 'border-blue-200',
                    icon: 'bg-blue-100 text-blue-600',
                    text: 'text-blue-800',
                    subtext: 'text-blue-700',
                    badge: 'bg-blue-100 text-blue-800'
                };
            default:
                return {
                    bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
                    border: 'border-emerald-200',
                    icon: 'bg-emerald-100 text-emerald-600',
                    text: 'text-emerald-800',
                    subtext: 'text-emerald-700',
                    badge: 'bg-emerald-100 text-emerald-800'
                };
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
                {/* Enhanced Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">AI Career Insights</h3>
                                <p className="text-blue-100 text-sm">
                                    Smart analysis for <span className="font-semibold">{job.title}</span> at <span className="font-semibold">{job.company}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 cursor-pointer hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <XCircle className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Enhanced Tabs */}
                    <div className="flex gap-1 mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-1">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 px-4 py-3 cursor-pointer font-medium rounded-lg transition-all duration-300 ${
                                activeTab === 'upload'
                                    ? 'bg-white text-purple-700 shadow-lg'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload
                        </button>
                        <button
                            onClick={() => setActiveTab('tips')}
                            disabled={!resumeFile}
                            className={`flex-1 px-4 py-3  font-medium rounded-lg transition-all duration-300 ${
                                activeTab === 'tips'
                                    ? 'bg-white text-purple-700 shadow-lg'
                                    : resumeFile 
                                        ? 'text-white/80 cursor-pointer hover:text-white hover:bg-white/10' 
                                        : 'text-white/40 cursor-not-allowed'
                            }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Tips
                        </button>
                        <button
                            onClick={() => setActiveTab('matching')}
                            disabled={!resumeFile}
                            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-all duration-300 ${
                                activeTab === 'matching'
                                    ? 'bg-white text-purple-700 shadow-lg'
                                    : resumeFile 
                                        ? 'text-white/80 cursor-pointer hover:text-white hover:bg-white/10' 
                                        : 'text-white/40 cursor-not-allowed'
                            }`}
                        >
                            <Target className="w-4 h-4 inline mr-2" />
                            Matching
                        </button>
                        <button
                            onClick={() => setActiveTab('prediction')}
                            disabled={!resumeFile}
                            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-all duration-300 ${
                                activeTab === 'prediction'
                                    ? 'bg-white text-purple-700 shadow-lg'
                                    : resumeFile 
                                        ? 'text-white/80 cursor-pointer hover:text-white hover:bg-white/10' 
                                        : 'text-white/40 cursor-not-allowed'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4 inline mr-2" />
                            Prediction
                        </button>
                    </div>
                </div>

                {/* Content with Custom Scrollbar */}
                <div className="p-6 max-h-[calc(95vh-200px)] overflow-y-auto custom-scrollbar">
                    {/* Upload Tab */}
                    {activeTab === 'upload' && (
                        <div className="space-y-6">
                            {!resumeFile ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-10 h-10 text-purple-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-3">Upload Your Resume</h4>
                                    <p className="text-slate-600 mb-4 text-lg">
                                        Drag and drop your resume here, or click to browse
                                    </p>
                                    <p className="text-sm text-slate-500 bg-slate-100 rounded-lg px-4 py-2 inline-block">
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
                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-100 p-3 rounded-xl">
                                                <File className="w-8 h-8 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-emerald-800 text-lg">{resumeFile.name}</h4>
                                                <p className="text-emerald-600">
                                                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI analysis
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeResume}
                                            className="p-2 hover:bg-emerald-100 cursor-pointer rounded-xl transition-colors"
                                        >
                                            <X className="w-5 h-5 text-emerald-600" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {resumeFile && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-10 h-10 rounded-xl flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="font-bold text-purple-800 text-lg">Ready for AI Analysis!</h4>
                                    </div>
                                    <p className="text-purple-700 mb-6">
                                        Your resume has been uploaded successfully. Choose an analysis type to get AI-powered insights:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setActiveTab('tips')}
                                            className="group p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer text-left transform hover:scale-105"
                                        >
                                            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <p className="font-semibold text-slate-800 mb-1">Resume Tips</p>
                                            <p className="text-xs text-slate-600">Get optimization suggestions</p>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('matching')}
                                            className="group p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-105"
                                        >
                                            <div className="bg-yellow-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition-colors">
                                                <Target className="w-5 h-5 text-yellow-600" />
                                            </div>
                                            <p className="font-semibold text-slate-800 mb-1">Job Matching</p>
                                            <p className="text-xs text-slate-600">See skill alignment</p>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('prediction')}
                                            className="group p-4 bg-white cursor-pointer rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-105"
                                        >
                                            <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                            </div>
                                            <p className="font-semibold text-slate-800 mb-1">Success Prediction</p>
                                            <p className="text-xs text-slate-600">Get probability scores</p>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resume Tips Tab */}
                    {activeTab === 'tips' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">Resume Optimization Tips</h4>
                                    <p className="text-slate-600">AI-powered suggestions to improve your resume for this position</p>
                                </div>
                                <button
                                    onClick={() => analyzeWithAI('resumeTips')}
                                    disabled={isAnalyzing}
                                    className="bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="w-5 h-5 mr-2" />
                                            Analyze Resume
                                        </>
                                    )}
                                </button>
                            </div>

                            {analysisResults.resumeTips ? (
                                <div className="space-y-6">
                                    {/* Overall Score */}
                                    {analysisResults.resumeTips.overallScore && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center shadow-lg">
                                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4 shadow-lg">
                                                <span className="text-2xl font-bold text-white">
                                                    {analysisResults.resumeTips.overallScore}%
                                                </span>
                                            </div>
                                            <h5 className="font-bold text-blue-800 mb-2 text-lg">Resume Score</h5>
                                            {analysisResults.resumeTips.summary && (
                                                <p className="text-blue-700">{analysisResults.resumeTips.summary}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Enhanced Tips */}
                                    <div className="space-y-4">
                                        {analysisResults.resumeTips.tips?.map((tip, index) => {
                                            const style = getPriorityStyle(tip.priority);
                                            return (
                                                <div key={index} className={`${style.bg} ${style.border} border rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`${style.icon} rounded-xl p-2 mt-1`}>
                                                            <Zap className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className={`${style.badge} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                                                    {tip.priority} • {tip.category}
                                                                </span>
                                                                <button
                                                                    onClick={() => copyToClipboard(tip.suggestion)}
                                                                    className="p-2 cursor-pointer hover:bg-white/50 rounded-lg transition-colors"
                                                                >
                                                                    <Copy className="w-4 h-4 text-slate-600" />
                                                                </button>
                                                            </div>
                                                            <h6 className={`${style.text} font-semibold mb-2 text-lg`}>
                                                                {tip.suggestion}
                                                            </h6>
                                                            {tip.explanation && (
                                                                <p className={`${style.subtext} text-sm leading-relaxed`}>
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
                                <div className="text-center py-16 text-slate-500">
                                    <div className="bg-slate-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-10 h-10 opacity-50" />
                                    </div>
                                    <p className="text-lg font-medium">Click "Analyze Resume" to get personalized tips</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Job Matching Tab */}
                    {activeTab === 'matching' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">Job Skills Matching</h4>
                                    <p className="text-slate-600">Analyze how well your skills align with job requirements</p>
                                </div>
                                <button
                                    onClick={() => analyzeWithAI('jobMatching')}
                                    disabled={isAnalyzing}
                                    className="bg-gradient-to-r cursor-pointer from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="w-5 h-5 mr-2" />
                                            Analyze Match
                                        </>
                                    )}
                                </button>
                            </div>

                            {analysisResults.jobMatching ? (
                                <div className="space-y-6">
                                    {/* Match Score */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 shadow-lg">
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4 shadow-lg">
                                                <span className="text-3xl font-bold text-white">
                                                    {analysisResults.jobMatching.overallMatch}%
                                                </span>
                                            </div>
                                            <h5 className="text-xl font-bold text-yellow-800 mb-2">Overall Match Score</h5>
                                            <p className="text-yellow-700 text-lg">
                                                {analysisResults.jobMatching.overallMatch >= 80 ? '🎉 Excellent match!' :
                                                    analysisResults.jobMatching.overallMatch >= 60 ? '👍 Good match with room for improvement' :
                                                        '💪 Consider improving your skills for better alignment'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Skills Breakdown */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-emerald-100 p-2 rounded-lg">
                                                    <Check className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <h5 className="font-bold text-emerald-800 text-lg">Matched Skills</h5>
                                            </div>
                                            <div className="space-y-3">
                                                {analysisResults.jobMatching.skillsMatch?.matchedSkills?.map((skill, index) => (
                                                    <div key={index} className="flex items-center gap-3 bg-white/70 rounded-lg p-3">
                                                        <div className="bg-emerald-100 p-1 rounded">
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                        </div>
                                                        <span className="text-emerald-800 font-medium">{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-blue-100 p-2 rounded-lg">
                                                    <Target className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <h5 className="font-bold text-blue-800 text-lg">Skills to Develop</h5>
                                            </div>
                                            <div className="space-y-3">
                                                {analysisResults.jobMatching.skillsMatch?.missingSkills?.map((skill, index) => (
                                                    <div key={index} className="flex items-center gap-3 bg-white/70 rounded-lg p-3">
                                                        <div className="bg-blue-100 p-1 rounded">
                                                            <Target className="w-3 h-3 text-blue-600" />
                                                        </div>
                                                        <span className="text-blue-800 font-medium">{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Experience Match */}
                                    {analysisResults.jobMatching.experienceMatch && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-purple-100 p-2 rounded-lg">
                                                    <Award className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <h5 className="font-bold text-purple-800 text-lg">Experience Analysis</h5>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white/70 rounded-lg p-4">
                                                    <p className="text-sm text-purple-600 mb-1">Experience Score</p>
                                                    <p className="text-2xl font-bold text-purple-800">
                                                        {analysisResults.jobMatching.experienceMatch.score}%
                                                    </p>
                                                </div>
                                                <div className="bg-white/70 rounded-lg p-4">
                                                    <p className="text-sm text-purple-600 mb-1">Level Match</p>
                                                    <p className="text-2xl font-bold text-purple-800 capitalize">
                                                        {analysisResults.jobMatching.experienceMatch.levelMatch}
                                                    </p>
                                                </div>
                                            </div>
                                            {analysisResults.jobMatching.experienceMatch.relevantExperience && (
                                                <p className="text-purple-700 mt-4 bg-white/70 rounded-lg p-4">
                                                    {analysisResults.jobMatching.experienceMatch.relevantExperience}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {analysisResults.jobMatching.recommendations && (
                                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-cyan-100 p-2 rounded-lg">
                                                    <Sparkles className="w-5 h-5 text-cyan-600" />
                                                </div>
                                                <h5 className="font-bold text-cyan-800 text-lg">Recommendations</h5>
                                            </div>
                                            <div className="space-y-3">
                                                {analysisResults.jobMatching.recommendations.map((rec, index) => (
                                                    <div key={index} className="flex items-start gap-3 bg-white/70 rounded-lg p-4">
                                                        <div className="bg-cyan-100 p-1 rounded mt-1">
                                                            <Target className="w-3 h-3 text-cyan-600" />
                                                        </div>
                                                        <span className="text-cyan-800 font-medium">{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-500">
                                    <div className="bg-slate-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Target className="w-10 h-10 opacity-50" />
                                    </div>
                                    <p className="text-lg font-medium">Click "Analyze Match" to see skill alignment</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Success Prediction Tab */}
                    {activeTab === 'prediction' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">Success Prediction</h4>
                                    <p className="text-slate-600">AI-calculated probability of application success</p>
                                </div>
                                <button
                                    onClick={() => analyzeWithAI('successPrediction')}
                                    disabled={isAnalyzing}
                                    className="bg-gradient-to-r cursor-pointer from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="w-5 h-5 mr-2" />
                                            Calculate Score
                                        </>
                                    )}
                                </button>
                            </div>

                            {analysisResults.successPrediction ? (
                                <div className="space-y-6">
                                    {/* Success Score */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 shadow-lg">
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
                                                <span className="text-4xl font-bold text-white">
                                                    {analysisResults.successPrediction.successScore}%
                                                </span>
                                            </div>
                                            <h5 className="text-2xl font-bold text-green-800 mb-2">Success Probability</h5>
                                            <p className="text-green-700 text-lg mb-2">
                                                {analysisResults.successPrediction.successScore >= 80 ? '🚀 High chance of success!' :
                                                    analysisResults.successPrediction.successScore >= 60 ? '✨ Good prospects with improvements' :
                                                        '💡 Consider enhancing your profile'}
                                            </p>
                                            {analysisResults.successPrediction.confidence && (
                                                <p className="text-sm text-green-600 bg-white/70 rounded-lg px-4 py-2 inline-block">
                                                    Confidence: {analysisResults.successPrediction.confidence}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Factors Breakdown */}
                                    {analysisResults.successPrediction.factors && (
                                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="bg-slate-100 p-2 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <h5 className="font-bold text-slate-800 text-lg">Success Factors</h5>
                                            </div>
                                            <div className="space-y-4">
                                                {Object.entries(analysisResults.successPrediction.factors).map(([factor, score]) => (
                                                    <div key={factor} className="bg-white rounded-lg p-4 shadow-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-slate-700 font-medium capitalize">
                                                                {factor.replace(/([A-Z])/g, ' $1').trim()}
                                                            </span>
                                                            <span className="text-lg font-bold text-slate-800">
                                                                {score}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                                    score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                                                                    'bg-gradient-to-r from-blue-500 to-purple-500'
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
                                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-emerald-100 p-2 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <h5 className="font-bold text-emerald-800 text-lg">Key Insights</h5>
                                            </div>
                                            <div className="space-y-3">
                                                {analysisResults.successPrediction.insights.map((insight, index) => (
                                                    <div key={index} className="flex items-start gap-3 bg-white/70 rounded-lg p-4">
                                                        <div className="bg-emerald-100 p-1 rounded mt-1">
                                                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                                                        </div>
                                                        <span className="text-emerald-800 font-medium">{insight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Improvement Areas */}
                                    {analysisResults.successPrediction.improvementAreas && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-blue-100 p-2 rounded-lg">
                                                    <Target className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <h5 className="font-bold text-blue-800 text-lg">Areas for Improvement</h5>
                                            </div>
                                            <div className="space-y-3">
                                                {analysisResults.successPrediction.improvementAreas.map((area, index) => (
                                                    <div key={index} className="flex items-start gap-3 bg-white/70 rounded-lg p-4">
                                                        <div className="bg-blue-100 p-1 rounded mt-1">
                                                            <Target className="w-3 h-3 text-blue-600" />
                                                        </div>
                                                        <span className="text-blue-800 font-medium">{area}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Competitive Advantages */}
                                    {analysisResults.successPrediction.competitiveAdvantages && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-purple-100 p-2 rounded-lg">
                                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <h5 className="font-bold text-purple-800 text-lg">Your Competitive Advantages</h5>
                                            </div>
                                            <div className="space-y-3">
                                                {analysisResults.successPrediction.competitiveAdvantages.map((advantage, index) => (
                                                    <div key={index} className="flex items-start gap-3 bg-white/70 rounded-lg p-4">
                                                        <div className="bg-purple-100 p-1 rounded mt-1">
                                                            <Sparkles className="w-3 h-3 text-purple-600" />
                                                        </div>
                                                        <span className="text-purple-800 font-medium">{advantage}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-500">
                                    <div className="bg-slate-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="w-10 h-10 opacity-50" />
                                    </div>
                                    <p className="text-lg font-medium">Click "Calculate Score" to get success prediction</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <Toaster
                position="top-center"
                reverseOrder={true}
            />

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
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