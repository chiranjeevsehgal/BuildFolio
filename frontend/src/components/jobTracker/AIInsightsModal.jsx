import React, { useState, useRef, useEffect } from 'react';
import {
    XCircle, Bot, Upload, FileText, Target, CheckCircle,
    Sparkles, Download, Copy, AlertCircle, RefreshCw,
    File, Check, X
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
    const [jobAnalysis, setJobAnalysis] = useState(null); // Store job analysis
    const fileInputRef = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Set up axios defaults
        axios.defaults.baseURL = API_BASE_URL;
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

    }, []);

    // Load job analysis when modal opens
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

    // Analyze job description (without resume)
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

            // Handle axios error response
            const errorMessage = error.response?.data?.message || error.message || 'Failed to analyze job description';
            toast.error(`Job analysis failed: ${errorMessage}`);
            return null;
        }
    };

    // Analyze resume with AI
    const analyzeWithAI = async (analysisType) => {
        if (!resumeFile) {
            toast.error('Please upload your resume first');
            return;
        }

        setIsAnalyzing(true);
        try {

            // Create FormData for file upload
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
                // Update the specific analysis result
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

            // Handle specific error cases
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

    // Helper function to get analysis type label
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

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">AI Insights</h3>
                                <p className="text-slate-600">
                                    Analyze your resume for <span className="font-medium">{job.title}</span> at <span className="font-medium">{job.company}</span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <XCircle className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4 border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'upload'
                                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload Resume
                        </button>
                        <button
                            onClick={() => setActiveTab('tips')}
                            disabled={!resumeFile}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'tips'
                                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50'
                                : resumeFile ? 'text-slate-600 hover:text-slate-800' : 'text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Resume Tips
                        </button>
                        <button
                            onClick={() => setActiveTab('matching')}
                            disabled={!resumeFile}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'matching'
                                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50'
                                : resumeFile ? 'text-slate-600 hover:text-slate-800' : 'text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <Target className="w-4 h-4 inline mr-2" />
                            Job Matching
                        </button>
                        <button
                            onClick={() => setActiveTab('prediction')}
                            disabled={!resumeFile}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'prediction'
                                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50'
                                : resumeFile ? 'text-slate-600 hover:text-slate-800' : 'text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            Success Prediction
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Upload Tab */}
                    {activeTab === 'upload' && (
                        <div className="space-y-6">
                            {!resumeFile ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-colors cursor-pointer"
                                >
                                    <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Upload Your Resume</h4>
                                    <p className="text-slate-600 mb-4">
                                        Drag and drop your resume here, or click to browse
                                    </p>
                                    <p className="text-sm text-slate-500">
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
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <File className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-green-800">{resumeFile.name}</h4>
                                                <p className="text-sm text-green-600">
                                                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeResume}
                                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-green-600" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {resumeFile && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                                    <h4 className="font-semibold text-purple-800 mb-3">Ready for AI Analysis!</h4>
                                    <p className="text-purple-700 mb-4">
                                        Your resume has been uploaded. Click on the tabs above to get AI-powered insights:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setActiveTab('tips')}
                                            className="p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors text-left"
                                        >
                                            <FileText className="w-5 h-5 text-blue-600 mb-2" />
                                            <p className="font-medium text-slate-800">Resume Tips</p>
                                            <p className="text-xs text-slate-600">Get optimization suggestions</p>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('matching')}
                                            className="p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors text-left"
                                        >
                                            <Target className="w-5 h-5 text-yellow-600 mb-2" />
                                            <p className="font-medium text-slate-800">Job Matching</p>
                                            <p className="text-xs text-slate-600">See skill alignment</p>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('prediction')}
                                            className="p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors text-left"
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                                            <p className="font-medium text-slate-800">Success Prediction</p>
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
                                    <h4 className="text-lg font-semibold text-slate-800">Resume Optimization Tips</h4>
                                    <p className="text-slate-600">AI-powered suggestions to improve your resume for this job</p>
                                </div>
                                <button
                                    onClick={() => analyzeWithAI('resumeTips')}
                                    disabled={isAnalyzing}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center disabled:opacity-50"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="w-4 h-4 mr-2" />
                                            Analyze Resume
                                        </>
                                    )}
                                </button>
                            </div>

                            {analysisResults.resumeTips ? (
                                <div className="space-y-6">
                                    {/* Overall Score */}
                                    {analysisResults.resumeTips.overallScore && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                                                <span className="text-xl font-bold text-blue-800">
                                                    {analysisResults.resumeTips.overallScore}%
                                                </span>
                                            </div>
                                            <h5 className="font-semibold text-blue-800 mb-2">Resume Score</h5>
                                            {analysisResults.resumeTips.summary && (
                                                <p className="text-blue-700 text-sm">{analysisResults.resumeTips.summary}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tips */}
                                    <div className="space-y-3">
                                        {analysisResults.resumeTips.tips?.map((tip, index) => (
                                            <div key={index} className={`border rounded-lg p-4 flex items-start gap-3 ${tip.priority === 'high' ? 'bg-red-50 border-red-200' :
                                                tip.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                                                    'bg-green-50 border-green-200'
                                                }`}>
                                                <div className={`rounded-full p-1 mt-0.5 ${tip.priority === 'high' ? 'bg-red-100' :
                                                    tip.priority === 'medium' ? 'bg-yellow-100' :
                                                        'bg-green-100'
                                                    }`}>
                                                    <FileText className={`w-3 h-3 ${tip.priority === 'high' ? 'text-red-600' :
                                                        tip.priority === 'medium' ? 'text-yellow-600' :
                                                            'text-green-600'
                                                        }`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded ${tip.priority === 'high' ? 'bg-red-200 text-red-800' :
                                                            tip.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                                'bg-green-200 text-green-800'
                                                            }`}>
                                                            {tip.priority?.toUpperCase()} • {tip.category?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm font-medium mb-1 ${tip.priority === 'high' ? 'text-red-800' :
                                                        tip.priority === 'medium' ? 'text-yellow-800' :
                                                            'text-green-800'
                                                        }`}>
                                                        {tip.suggestion}
                                                    </p>
                                                    {tip.explanation && (
                                                        <p className={`text-xs ${tip.priority === 'high' ? 'text-red-700' :
                                                            tip.priority === 'medium' ? 'text-yellow-700' :
                                                                'text-green-700'
                                                            }`}>
                                                            {tip.explanation}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(tip.suggestion)}
                                                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                                                >
                                                    <Copy className="w-3 h-3 text-slate-600" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Click "Analyze Resume" to get personalized tips</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Job Matching Tab */}
                    {activeTab === 'matching' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-800">Job Skills Matching</h4>
                                    <p className="text-slate-600">See how well your skills align with job requirements</p>
                                </div>
                                <button
                                    onClick={() => analyzeWithAI('jobMatching')}
                                    disabled={isAnalyzing}
                                    className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 transition-colors flex items-center disabled:opacity-50"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="w-4 h-4 mr-2" />
                                            Analyze Match
                                        </>
                                    )}
                                </button>
                            </div>

                            {analysisResults.jobMatching ? (
                                <div className="space-y-6">
                                    {/* Match Score */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                                                <span className="text-2xl font-bold text-yellow-800">
                                                    {analysisResults.jobMatching.overallMatch}%
                                                </span>
                                            </div>
                                            <h5 className="text-lg font-semibold text-yellow-800 mb-2">Overall Match Score</h5>
                                            <p className="text-yellow-700">
                                                {analysisResults.jobMatching.overallMatch >= 80 ? 'Excellent match!' :
                                                    analysisResults.jobMatching.overallMatch >= 60 ? 'Good match with room for improvement' :
                                                        'Consider improving your skills for better alignment'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Skills Breakdown */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                            <h5 className="font-semibold text-green-800 mb-3">Matched Skills</h5>
                                            <div className="space-y-2">
                                                {analysisResults.jobMatching.skillsMatch?.matchedSkills?.map((skill, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Check className="w-4 h-4 text-green-600" />
                                                        <span className="text-green-700">{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                            <h5 className="font-semibold text-red-800 mb-3">Missing Skills</h5>
                                            <div className="space-y-2">
                                                {analysisResults.jobMatching.skillsMatch?.missingSkills?.map((skill, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                                        <span className="text-red-700">{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Experience Match */}
                                    {analysisResults.jobMatching.experienceMatch && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                            <h5 className="font-semibold text-blue-800 mb-3">Experience Analysis</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-blue-600 mb-1">Experience Score</p>
                                                    <p className="text-lg font-semibold text-blue-800">
                                                        {analysisResults.jobMatching.experienceMatch.score}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-blue-600 mb-1">Level Match</p>
                                                    <p className="text-lg font-semibold text-blue-800 capitalize">
                                                        {analysisResults.jobMatching.experienceMatch.levelMatch}
                                                    </p>
                                                </div>
                                            </div>
                                            {analysisResults.jobMatching.experienceMatch.relevantExperience && (
                                                <p className="text-blue-700 mt-3">
                                                    {analysisResults.jobMatching.experienceMatch.relevantExperience}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {analysisResults.jobMatching.recommendations && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                            <h5 className="font-semibold text-yellow-800 mb-3">Recommendations</h5>
                                            <div className="space-y-2">
                                                {analysisResults.jobMatching.recommendations.map((rec, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <Target className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                        <span className="text-yellow-700 text-sm">{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Click "Analyze Match" to see skill alignment</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Success Prediction Tab */}
                    {activeTab === 'prediction' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-800">Success Prediction</h4>
                                    <p className="text-slate-600">AI-calculated probability of application success</p>
                                </div>
                                <button
                                    onClick={() => analyzeWithAI('successPrediction')}
                                    disabled={isAnalyzing}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center disabled:opacity-50"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="w-4 h-4 mr-2" />
                                            Calculate Score
                                        </>
                                    )}
                                </button>
                            </div>

                            {analysisResults.successPrediction ? (
                                <div className="space-y-6">
                                    {/* Success Score */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
                                                <span className="text-3xl font-bold text-green-800">
                                                    {analysisResults.successPrediction.successScore}%
                                                </span>
                                            </div>
                                            <h5 className="text-xl font-semibold text-green-800 mb-2">Success Probability</h5>
                                            <p className="text-green-700">
                                                {analysisResults.successPrediction.successScore >= 80 ? 'High chance of success!' :
                                                    analysisResults.successPrediction.successScore >= 60 ? 'Good prospects with improvements' :
                                                        'Consider enhancing your profile'}
                                            </p>
                                            {analysisResults.successPrediction.confidence && (
                                                <p className="text-sm text-green-600 mt-2">
                                                    Confidence: {analysisResults.successPrediction.confidence}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Factors Breakdown */}
                                    {analysisResults.successPrediction.factors && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                                            <h5 className="font-semibold text-slate-800 mb-4">Success Factors</h5>
                                            <div className="space-y-4">
                                                {Object.entries(analysisResults.successPrediction.factors).map(([factor, score]) => (
                                                    <div key={factor} className="flex items-center justify-between">
                                                        <span className="text-slate-700 capitalize">
                                                            {factor.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' :
                                                                        score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${score}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-600 w-10">
                                                                {score}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Insights */}
                                    {analysisResults.successPrediction.insights && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                            <h5 className="font-semibold text-green-800 mb-3">Key Insights</h5>
                                            <div className="space-y-2">
                                                {analysisResults.successPrediction.insights.map((insight, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                                        <span className="text-green-700 text-sm">{insight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Improvement Areas */}
                                    {analysisResults.successPrediction.improvementAreas && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                            <h5 className="font-semibold text-yellow-800 mb-3">Areas for Improvement</h5>
                                            <div className="space-y-2">
                                                {analysisResults.successPrediction.improvementAreas.map((area, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                        <span className="text-yellow-700 text-sm">{area}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Competitive Advantages */}
                                    {analysisResults.successPrediction.competitiveAdvantages && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                            <h5 className="font-semibold text-blue-800 mb-3">Your Competitive Advantages</h5>
                                            <div className="space-y-2">
                                                {analysisResults.successPrediction.competitiveAdvantages.map((advantage, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                                                        <span className="text-blue-700 text-sm">{advantage}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Click "Calculate Score" to get success prediction</p>
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
        </div>
    );
};

export default AIInsightsModal;