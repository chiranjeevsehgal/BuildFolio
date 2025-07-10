import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Zap,
  Globe,
  Users,
  Mail,
  Sparkles,
  Check,
  Star,
  User,
  LogOut,
  Briefcase,
  Bot,
  Target,
  TrendingUp,
  FileText,
  Timer,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Building2,
} from "lucide-react";
import Footer from "../components/Footer";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      // Verify token and get user data
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setIsLoggedIn(true);
          setCurrentUser(data.user);
        } else {
          // Invalid token
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
        }
      } else {
        // Token expired or invalid
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.reload();
  };

  const handleGetStarted = () => {
    // Redirect to dashboard or profile setup
    if (isLoggedIn) {
      window.location.href = "/portfolio";
    } else {
      window.location.href = "/signin";
    }
  };

  const handleViewTemplates = () => {
    if (isLoggedIn) {
      window.location.href = "/templates";
    } else {
      window.location.href = "/signin";
    }
  };

  const handleJobTracker = () => {
    if (isLoggedIn) {
      window.location.href = "/jobtracker";
    } else {
      window.location.href = "/signin";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src="logo.svg" className="Logo" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  BuildFolio
                </span>
              </div>
            </a>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse flex space-x-2">
                  <div className="h-8 w-16 bg-slate-200 rounded"></div>
                  <div className="h-8 w-20 bg-slate-200 rounded"></div>
                </div>
              ) : isLoggedIn ? (
                <a href="/portfolio">
                  <div className="flex items-center space-x-4">
                    {/* User Profile Info */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {currentUser?.firstName?.[0]?.toUpperCase()}
                          {currentUser?.lastName?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-800">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              ) : (
                <>
                  <button
                    onClick={handleGetStarted}
                    className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Star className="w-4 h-4 mr-1" />
                {isLoggedIn
                  ? "Welcome back!"
                  : "Portfolio + Job Tracker + AI Insights"}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-3 ">
              {isLoggedIn ? (
                <>
                  Welcome back,
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent block pb-6">
                    {currentUser?.firstName}!
                  </span>
                </>
              ) : (
                <>
                  Your Complete Career
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent block">
                    Success Platform
                  </span>
                </>
              )}
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {isLoggedIn
                ? currentUser?.portfolioDeployed
                  ? "Your portfolio is live! Track job applications with AI insights or create a new custom theme."
                  : currentUser?.isProfileCompleted
                    ? "Your profile is ready! Choose a template, deploy your portfolio, and start tracking your job applications."
                    : "Complete your profile setup, choose from our beautiful templates, and manage your job search with AI-powered insights."
                : "Create stunning portfolios, track job applications with smart Kanban boards, and get AI-powered career insights - all in one powerful platform."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center font-semibold text-lg cursor-pointer"
              >
                {isLoggedIn ? (
                  <>
                    View Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  <>
                    Start Building Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>

              {isLoggedIn ? (
                <button
                  onClick={handleJobTracker}
                  className="border-2 cursor-pointer border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-semibold text-lg flex items-center justify-center"
                >
                  <Briefcase className="mr-2 w-5 h-5" />
                  Job Tracker
                </button>
              ) : (
                <button
                  onClick={handleViewTemplates}
                  className="border-2 cursor-pointer border-slate-300 text-slate-700 px-8 py-4 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 font-semibold text-lg"
                >
                  View Templates
                </button>
              )}
            </div>

            {/* User Status Indicator */}
            {isLoggedIn && (
              <div className="mt-8 flex justify-center">
                <div className="bg-white rounded-full px-6 py-3 shadow-md border border-slate-200">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${currentUser?.isProfileCompleted ? "bg-green-500" : "bg-yellow-500"}`}
                      ></div>
                      <span>
                        Profile:{" "}
                        {currentUser?.isProfileCompleted
                          ? "Complete"
                          : "Pending"}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-slate-300"></div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${currentUser?.selectedTemplate ? "bg-green-500" : "bg-gray-400"}`}
                      ></div>
                      <span>
                        Template:{" "}
                        {currentUser?.selectedTemplate
                          ? "Selected"
                          : "Not Selected"}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-slate-300"></div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${currentUser?.portfolioDeployed ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                      ></div>
                      <span>
                        Portfolio:{" "}
                        {currentUser?.portfolioDeployed
                          ? "Live"
                          : "Not Deployed"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Everything You Need to Shine
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Professional portfolio creation and job tracking made simple with
              powerful features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Lightning Fast Setup
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Update your profile and watch your portfolio come to life in
                seconds. No technical skills needed.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Your Personal Domain
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get your unique portfolio URL (buildfolio.in/yourname) that you
                can share with employers and clients.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Professional Templates
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Choose from carefully crafted templates designed by
                professionals. Mobile-responsive and modern.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Smart Job Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Organize applications with Kanban boards, AI insights, and
                success predictions. Never lose track of opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Tracker Showcase Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <Briefcase className="w-4 h-4 mr-2" />
                AI-Powered Job Tracking
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6">
              Smart Job Application
              <span className="bg-gradient-to-r from-purple-600 pb-4 to-pink-600 bg-clip-text text-transparent block">
                Tracking System
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Organize your job search with our intuitive Kanban board, get
              AI-powered resume insights, and track your success probability for
              every application.
            </p>
          </div>

          {/* Kanban Board Preview */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-16 border border-white/50">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {/* Applied Column */}
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-2 border-blue-200/50 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <h3 className="font-bold text-sm">Applied</h3>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                      3
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="bg-white/95 rounded-xl p-3 shadow-sm border-l-4 border-l-blue-500">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                      Frontend Developer
                    </h4>
                    <p className="text-slate-600 text-xs flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      Tech Corp
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs flex items-center">
                        <Bot className="w-2 h-2 mr-1" />
                        AI
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                  </div>
                  <div className="bg-white/95 rounded-xl p-3 shadow-sm border-l-4 border-l-green-500">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                      React Developer
                    </h4>
                    <p className="text-slate-600 text-xs flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      StartupXYZ
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                        Remote
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Column */}
              <div className="bg-gradient-to-br from-yellow-50/80 to-orange-50/80 border-2 border-yellow-200/50 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-yellow-600 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <h3 className="font-bold text-sm">Interview</h3>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                      2
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="bg-white/95 rounded-xl p-3 shadow-sm border-l-4 border-l-yellow-500">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                      Full Stack Dev
                    </h4>
                    <p className="text-slate-600 text-xs flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      InnovateLabs
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs flex items-center">
                        <Bot className="w-2 h-2 mr-1" />
                        85%
                      </div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-2 border-purple-200/50 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-purple-600 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4" />
                      <h3 className="font-bold text-sm">In Progress</h3>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                      1
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="bg-white/95 rounded-xl p-3 shadow-sm border-l-4 border-l-purple-500">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                      Senior Developer
                    </h4>
                    <p className="text-slate-600 text-xs flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      MegaCorp
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs flex items-center">
                        <Target className="w-2 h-2 mr-1" />
                        92%
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Column */}
              <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-2 border-green-200/50 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-green-600 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <h3 className="font-bold text-sm">Offer</h3>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                      1
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="bg-white/95 rounded-xl p-3 shadow-sm border-l-4 border-l-green-500">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                      Lead Developer
                    </h4>
                    <p className="text-slate-600 text-xs flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      DreamJob Inc
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs flex items-center">
                        <Sparkles className="w-2 h-2 mr-1" />
                        98%
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejected Column */}
              <div className="bg-gradient-to-br from-red-50/80 to-pink-50/80 border-2 border-red-200/50 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-red-600 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4" />
                      <h3 className="font-bold text-sm">Rejected</h3>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                      1
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="bg-white/95 rounded-xl p-3 shadow-sm border-l-4 border-l-red-500">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                      Backend Dev
                    </h4>
                    <p className="text-slate-600 text-xs flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      TechGiant
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                        Feedback
                      </div>
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA for Job Tracker */}
            <div className="text-center mt-8">
              <button
                onClick={handleJobTracker}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto cursor-pointer hover:from-purple-700 hover:to-pink-700"
              >
                <Briefcase className="mr-2 w-5 h-5" />
                {isLoggedIn ? "Open Job Tracker" : "Try Job Tracker"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>

          {/* AI Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                AI Resume Analysis
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get personalized resume optimization tips with scoring and
                priority-based suggestions for each job application.
              </p>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Smart Job Matching
              </h3>
              <p className="text-slate-600 leading-relaxed">
                AI analyzes your skills against job requirements, showing match
                percentages and areas for improvement.
              </p>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Success Prediction
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get AI-calculated probability scores for each application with
                detailed factor breakdowns and insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Your Career Success Journey
            </h2>
            <p className="text-xl text-slate-600">
              From portfolio to job offers in simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl transition-all duration-300 ${
                  isLoggedIn
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                }`}
              >
                {isLoggedIn ? <Check className="w-8 h-8" /> : "1"}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Build Portfolio
              </h3>
              <p className="text-slate-600">
                Sign up, customize your professional information, and choose
                from beautiful templates.
              </p>
            </div>

            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl transition-all duration-300 ${
                  isLoggedIn && currentUser?.selectedTemplate
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-600"
                }`}
              >
                {isLoggedIn && currentUser?.selectedTemplate ? (
                  <Check className="w-8 h-8" />
                ) : (
                  "2"
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Track Applications
              </h3>
              <p className="text-slate-600">
                Use our smart Kanban board to organize and track all your job
                applications in one place.
              </p>
            </div>

            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600`}
              >
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Get AI Insights
              </h3>
              <p className="text-slate-600">
                Upload your resume for personalized optimization tips, job
                matching analysis, and success predictions.
              </p>
            </div>

            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl transition-all duration-300 ${
                  isLoggedIn && currentUser?.portfolioDeployed
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-yellow-500 to-orange-600"
                }`}
              >
                {isLoggedIn && currentUser?.portfolioDeployed ? (
                  <Check className="w-8 h-8" />
                ) : (
                  <Star className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Land Your Dream Job
              </h3>
              <p className="text-slate-600">
                Share your portfolio, apply strategically with AI guidance, and
                track your path to success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-black/10 rounded-3xl p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm"></div>
            <div className="relative flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0">
              {/* Left Content */}
              <div className="text-center lg:text-left lg:flex-1">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mr-4">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      AI-Powered Career Intelligence
                    </h3>
                    <p className="text-purple-100 text-lg">
                      Transform your job search with smart insights
                    </p>
                  </div>
                </div>
                <p className="text-purple-100 text-lg mb-8 lg:max-w-2xl">
                  Our advanced AI analyzes your resume, matches you with perfect
                  opportunities, and predicts your success rate for every
                  application. Stop guessing - start succeeding.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={handleGetStarted}
                    className="bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 cursor-pointer shadow-lg"
                  >
                    {isLoggedIn ? "Manage Portfolio" : "Get Started Free"}
                  </button>
                  <button
                    onClick={handleJobTracker}
                    className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    View Job Tracker
                  </button>
                </div>
              </div>

              {/* Right Content - Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:flex-1 lg:max-w-lg">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">
                    Resume Scoring
                  </h4>
                  <p className="text-purple-100 text-sm">
                    Get percentage scores with detailed improvement suggestions
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">
                    Skill Matching
                  </h4>
                  <p className="text-purple-100 text-sm">
                    See how your skills align with job requirements
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">
                    Success Prediction
                  </h4>
                  <p className="text-purple-100 text-sm">
                    AI calculates your probability of getting hired
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">
                    Smart Tracking
                  </h4>
                  <p className="text-purple-100 text-sm">
                    Organize applications with drag-and-drop boards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
