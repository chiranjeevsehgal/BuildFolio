import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Globe, Users, Mail , Sparkles, Check, Star, User, LogOut } from 'lucide-react';
import Footer from '../components/Footer';
import FloatingBuyMeCoffeeButton from '../components/FloatingGpayButton';

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
      const token = localStorage.getItem('authToken');

      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      // Verify token and get user data
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setIsLoggedIn(true);
          setCurrentUser(data.user);
        } else {
          // Invalid token
          localStorage.removeItem('authToken');
          setIsLoggedIn(false);
        }
      } else {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.reload();
  };

  const handleGetStarted = () => {
    // Redirect to dashboard or profile setup
    if (isLoggedIn) {
      window.location.href = '/portfolio';
    }
    else {
      window.location.href = '/signin';
    }
  };

  const handleViewTemplates = () => {
    if (isLoggedIn) {
      window.location.href = '/templates';
    } else {
      window.location.href = '/signin';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-center py-4">
            <a href='/'>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  {/* <Sparkles className="w-5 h-5 text-white" /> */}
                  <img src="logo.svg" className='Logo'/>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">BuildFolio</span>
              </div>
            </a>

            {/* <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-800 transition-colors">Features</a>
              <a href="/templates" className="text-slate-600 hover:text-slate-800 transition-colors">Templates</a>
            </nav> */}

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse flex space-x-2">
                  <div className="h-8 w-16 bg-slate-200 rounded"></div>
                  <div className="h-8 w-20 bg-slate-200 rounded"></div>
                </div>
              ) : isLoggedIn ? (
                <a href='/portfolio'>
                  <div className="flex items-center space-x-4">
                    {/* User Profile Info */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        {/* {currentUser?.profilePhoto ? (
                        <img
                          src={currentUser.profilePhoto}
                          alt={`${currentUser.firstName} ${currentUser.lastName}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src="https://res.cloudinary.com/dqwosfxu7/image/upload/v1749364926/Pngtree_avatar_placeholder_abstract_white_blue_6796235_ak8huu.png"
                          alt="Default Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )} */}
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {currentUser?.firstName?.[0]?.toUpperCase()}{currentUser?.lastName?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-800">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                      </div>
                    </div>

                    {/* Dashboard Button */}
                    {/* <a
                    href="/dashboard"
                    className="text-slate-600 hover:text-slate-800 transition-colors flex items-center space-x-1"
                    >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                    </a> */}

                    {/* Logout Button */}
                    {/* <button
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-slate-800 transition-colors flex items-center space-x-1"
                    >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                    </button> */}
                  </div>
                </a>
              ) : (
                <>
                  {/* <a href="/signin" className="text-slate-600 hover:text-slate-800 transition-colors">
                    Sign In
                  </a> */}
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
                {isLoggedIn ? 'Welcome back!' : 'No coding required'}
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
                  Create Your Professional
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent block">
                    Portfolio in Minutes
                  </span>
                </>
              )}
            </h1>

            <div className="hidden md:block">
          <FloatingBuyMeCoffeeButton />
        </div>

            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {isLoggedIn ? (
                currentUser?.portfolioDeployed ? (
                  'Your portfolio is live! You can view it, edit your profile, or create a new custom theme.'
                ) : currentUser?.isProfileCompleted ? (
                  'Your profile is ready! Choose a template and deploy your portfolio to make it live.'
                ) : (
                  'Complete your profile setup and choose from our beautiful templates to create your portfolio.'
                )
              ) : (
                'Transform your career story into a stunning portfolio website. Connect your LinkedIn, choose a template, and launch your professional presence online.'
              )}
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

              {isLoggedIn && (
                <button
                  onClick={handleViewTemplates}
                  className="border-2 cursor-pointer border-slate-300 text-slate-700 px-8 py-4 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 font-semibold text-lg"
                >
                  {isLoggedIn ? 'Browse Templates' : 'View Templates'}
                </button>
              )}
            </div>

            {/* User Status Indicator */}
            {isLoggedIn && (
              <div className="mt-8 flex justify-center">
                <div className="bg-white rounded-full px-6 py-3 shadow-md border border-slate-200">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${currentUser?.isProfileCompleted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span>Profile: {currentUser?.isProfileCompleted ? 'Complete' : 'Pending'}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-300"></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${currentUser?.selectedTemplate ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span>Template: {currentUser?.selectedTemplate ? 'Selected' : 'Not Selected'}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-300"></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${currentUser?.portfolioDeployed ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span>Portfolio: {currentUser?.portfolioDeployed ? 'Live' : 'Not Deployed'}</span>
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
        Professional portfolio creation made simple with powerful features
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Lightning Fast Setup</h3>
        <p className="text-slate-600 leading-relaxed">
          Update your profile and watch your portfolio come to life in seconds.
          No technical skills needed.
        </p>
      </div>

      <div className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Personal Domain</h3>
        <p className="text-slate-600 leading-relaxed">
          Get your unique portfolio URL (buildfolio.in/yourname) that you can share
          with employers and clients.
        </p>
      </div>

      <div className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Users className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Professional Templates</h3>
        <p className="text-slate-600 leading-relaxed">
          Choose from carefully crafted templates designed by professionals.
          Mobile-responsive and modern.
        </p>
      </div>

      <div className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Direct Contact Forms</h3>
        <p className="text-slate-600 leading-relaxed">
          Visitors can reach out to you directly through built-in contact forms.
          Messages are delivered straight to your email—no middleman required.
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
              Three Simple Steps
            </h2>
            <p className="text-xl text-slate-600">
              From signup to published portfolio in under 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl transition-all duration-300 ${isLoggedIn ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}>
                {isLoggedIn ? <Check className="w-8 h-8" /> : '1'}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Connect & Customize</h3>
              <p className="text-slate-600">
                Sign up and update your
                professional information.
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl transition-all duration-300 ${isLoggedIn && currentUser?.selectedTemplate ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}>
                {isLoggedIn && currentUser?.selectedTemplate ? <Check className="w-8 h-8" /> : '2'}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Choose Template</h3>
              <p className="text-slate-600">
                Select from our collection of professional templates to match your style.
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl transition-all duration-300 ${isLoggedIn && currentUser?.portfolioDeployed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}>
                {isLoggedIn && currentUser?.portfolioDeployed ? <Check className="w-8 h-8" /> : '3'}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Launch & Share</h3>
              <p className="text-slate-600">
                Your portfolio is instantly live with a custom URL.
                Share it with the world and land your dream opportunities.
              </p>
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