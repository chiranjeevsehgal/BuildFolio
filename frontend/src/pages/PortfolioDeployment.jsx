import React, { useState, useEffect } from "react";
import {
  Globe,
  Copy,
  ExternalLink,
  Settings,
  Eye,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit3,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ArrowRight,
  Zap,
  Sparkles,
  Rocket,
  Clock,
  Users,
  BarChart3,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import FloatingBuyMeCoffeeButton from "../components/FloatingGpayButton";

const PortfolioDeployment = () => {
  const [deploymentStatus, setDeploymentStatus] = useState("checking");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [username, setUsername] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [userData, setUserData] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [viewMode, setViewMode] = useState("desktop");
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const PORTFOLIO_BASE_URL = import.meta.env.VITE_FRONTEND_URL;

  useEffect(() => {
    // Set up axios defaults
    axios.defaults.baseURL = API_BASE_URL;
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    checkDeploymentStatus();
  }, []);

  useEffect(() => {
    // Only reset progress when not deploying
    if (deploymentStatus !== "deploying") {
      setDeploymentProgress(deploymentStatus === "deployed" ? 100 : 0);
    }
  }, [deploymentStatus]);

  // Check if portfolio is already deployed
  const checkDeploymentStatus = async () => {
    try {
      setDeploymentStatus("checking");

      const response = await axios.get("/auth/profile");

      if (response.data.success && response.data.user) {
        const user = response.data.user;

        setUserData(user);
        setUsername(user.username);
        setSelectedTemplate(user.selectedTemplate);

        // Check if portfolio is already deployed
        if (user.portfolioDeployed || user.isPortfolioDeployed) {
          setDeploymentStatus("deployed");
          const constructedUrl = `${PORTFOLIO_BASE_URL}/portfolio/${user.username}`;
          setPortfolioUrl(constructedUrl);
          setDeploymentProgress(100);
        } else {
          // Handle edge cases based on profile completion and template selection
          const isProfileCompleted = user.isProfileCompleted;
          const hasSelectedTemplate = user.selectedTemplate;

          if (!isProfileCompleted && !hasSelectedTemplate) {
            // Profile not completed AND no template selected
            setDeploymentStatus("profile-and-template-required");
          } else if (!isProfileCompleted && hasSelectedTemplate) {
            // Profile not completed BUT template selected
            setDeploymentStatus("profile-required");
          } else if (isProfileCompleted && !hasSelectedTemplate) {
            // Profile completed BUT no template selected
            setDeploymentStatus("template-required");
          } else if (isProfileCompleted && hasSelectedTemplate) {
            // Both profile completed AND template selected
            setDeploymentStatus("ready");
          } else {
            // Fallback case
            setDeploymentStatus("no-template");
          }
        }
      } else {
        throw new Error("Failed to load user data");
      }
    } catch (error) {
      console.error("Failed to check deployment status:", error);
      setDeploymentStatus("error");
      toast.error(
        error.response?.data?.message ||
          "Failed to load deployment information.",
      );
    }
  };

  // Deploy portfolio with progress simulation
  const deployPortfolio = async () => {
    try {
      setIsDeploying(true);
      setDeploymentStatus("deploying");
      setDeploymentProgress(0);

      // Create a single toast that will be updated
      const toastId = toast.loading("Deploying your portfolio...");

      // Deployment steps
      const steps = [
        { progress: 20, message: "Preparing your portfolio..." },
        { progress: 40, message: "Building template..." },
        { progress: 60, message: "Optimizing assets..." },
        { progress: 80, message: "Publishing to CDN..." },
        { progress: 95, message: "Finalizing deployment..." },
      ];

      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setDeploymentProgress(step.progress);
        toast.loading(step.message, { id: toastId });
      }

      const response = await axios.post("/portfolio/deploy", {
        templateId: selectedTemplate,
        username: username,
      });

      if (response.data.success) {
        setDeploymentStatus("deployed");
        setDeploymentProgress(100);

        const deployedUrl =
          response.data.portfolioUrl ||
          `${PORTFOLIO_BASE_URL}/portfolio/${username}`;
        setPortfolioUrl(deployedUrl);

        toast.success("Portfolio deployed successfully!", { id: toastId });

        // Wait for toast to show, then reload
        setTimeout(() => {
          window.location.reload();
        }, 2000); // 2 second delay

        setUserData((prev) => ({
          ...prev,
          portfolioDeployed: true,
          portfolioUrl: deployedUrl,
        }));
      } else {
        throw new Error(response.data.message || "Deployment failed");
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      setDeploymentStatus("error");
      setDeploymentProgress(0);
      toast.error(
        error.response?.data?.message ||
          "Failed to deploy portfolio. Please try again.",
        { id: toastId },
      );
    } finally {
      setIsDeploying(false);
    }
  };

  // Redeploy portfolio
  const redeployPortfolio = async () => {
    let toastId;
    try {
      setIsDeploying(true);
      toastId = toast.loading("Redeploying your portfolio!");

      const response = await axios.post("/portfolio/redeploy", {
        templateId: selectedTemplate,
        username: username,
      });

      if (response.data.success) {
        setTimeout(() => {
          toast.success("Portfolio redeployed successfully!", { id: toastId });
        }, 1000);

        if (response.data.portfolioUrl) {
          setPortfolioUrl(response.data.portfolioUrl);
        }
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Redeploy failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to update portfolio.",
        { id: toastId },
      );
    } finally {
      setIsDeploying(false);
    }
  };

  // Copy portfolio URL to clipboard
  const copyPortfolioUrl = async () => {
    if (!portfolioUrl) {
      toast.error("No portfolio URL available to copy.");
      return;
    }
    let toastId;
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      toastId = toast.loading("Copying Portfolio URL!");

      setTimeout(() => {
        toast.success("Portfolio URL copied to clipboard!", { id: toastId });
      }, 500);
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = portfolioUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      toast.success("Portfolio URL copied to clipboard", { id: toastId });
    }
  };

  // Unpublish portfolio
  const unpublishPortfolio = async () => {
    let toastId;
    try {
      setIsDeploying(true);
      toastId = toast.loading("Unpublishing your portfolio!");
      const response = await axios.patch("/portfolio/unpublish");

      if (response.data.success) {
        toast.success("Portfolio unpublished successfully!", { id: toastId });

        window.location.reload();
      } else {
        throw new Error(response.data.message || "Unpublish failed");
      }
    } catch (error) {
      console.error("Unpublish failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to unpublish portfolio.",
        { id: toastId },
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusConfig = () => {
    switch (deploymentStatus) {
      case "checking":
        return {
          icon: (
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 animate-spin text-blue-500" />
          ),
          title: "Checking Status",
          subtitle: "Loading your deployment information...",
          bgGradient: "from-blue-500/10 to-indigo-500/10",
          borderColor: "border-blue-200",
        };
      case "deploying":
        return {
          icon: (
            <Rocket className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-500 animate-pulse" />
          ),
          title: "Deploying Portfolio",
          subtitle: "Your portfolio is being deployed...",
          bgGradient: "from-blue-500/10 to-indigo-500/10",
          borderColor: "border-blue-200",
        };
      case "deployed":
        return {
          icon: (
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-500" />
          ),
          title: "Portfolio Live!",
          subtitle: "Your portfolio is successfully deployed and accessible",
          bgGradient: "from-green-500/10 to-emerald-500/10",
          borderColor: "border-green-200",
        };
      case "error":
        return {
          icon: (
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500" />
          ),
          title: "Deployment Error",
          subtitle: "Something went wrong with your deployment",
          bgGradient: "from-red-500/10 to-pink-500/10",
          borderColor: "border-red-200",
        };
      case "profile-and-template-required":
        return {
          icon: (
            <Settings className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-500" />
          ),
          title: "Getting Started",
          subtitle: "Complete your profile and select a template to deploy",
          bgGradient: "from-orange-500/10 to-yellow-500/10",
          borderColor: "border-orange-200",
        };
      case "profile-required":
        return {
          icon: (
            <Settings className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-500" />
          ),
          title: "Profile Incomplete",
          subtitle: "Complete your profile to deploy your portfolio",
          bgGradient: "from-orange-500/10 to-yellow-500/10",
          borderColor: "border-orange-200",
        };
      case "template-required":
        return {
          icon: (
            <Settings className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-500" />
          ),
          title: "Template Required",
          subtitle: "Select a template to deploy your portfolio",
          bgGradient: "from-orange-500/10 to-yellow-500/10",
          borderColor: "border-orange-200",
        };
      case "no-template":
        return {
          icon: (
            <Settings className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-500" />
          ),
          title: "Template Required",
          subtitle: "Please select a template before deploying your portfolio",
          bgGradient: "from-orange-500/10 to-yellow-500/10",
          borderColor: "border-orange-200",
        };
      default:
        return {
          icon: (
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-500" />
          ),
          title: "Ready to Deploy",
          subtitle: "Your portfolio is ready for deployment",
          bgGradient: "from-blue-500/10 to-indigo-500/10",
          borderColor: "border-blue-200",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <Navbar current={"/portfolio"} />
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
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 px-2">
                Portfolio Deployment
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2">
                Deploy your professional portfolio and showcase your work to the
                world
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 -mt-4 sm:-mt-6 lg:-mt-8 relative z-10">
          {/* Main Status Card */}
          <div
            className={`bg-gradient-to-br ${statusConfig.bgGradient} backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10 border ${statusConfig.borderColor} bg-white/80`}
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-6">{statusConfig.icon}</div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2 sm:mb-3 px-2">
                {statusConfig.title}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-4 sm:mb-6 px-2">
                {statusConfig.subtitle}
              </p>

              {/* User Info Cards */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                {username && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 border border-white/40">
                    <span className="text-xs sm:text-sm text-slate-600">
                      Username
                    </span>
                    <div className="font-semibold text-slate-800 text-sm sm:text-base">
                      @{username}
                    </div>
                  </div>
                )}
                {selectedTemplate && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 border border-white/40">
                    <span className="text-xs sm:text-sm text-slate-600">
                      Template
                    </span>
                    <div className="font-semibold text-slate-800 text-sm sm:text-base break-words">
                      {selectedTemplate}
                    </div>
                  </div>
                )}
                {deploymentStatus === "deployed" && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 border border-white/40">
                    <span className="text-xs sm:text-sm text-slate-600">
                      Status
                    </span>
                    <div className="font-semibold text-green-800 flex items-center text-sm sm:text-base">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar for Deployment */}
              {deploymentStatus === "deploying" && (
                <div className="w-full max-w-sm sm:max-w-md mx-auto mb-4 sm:mb-6">
                  <div className="bg-white/40 rounded-full h-2 sm:h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${deploymentProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2">
                    {Math.round(deploymentProgress)}% complete
                  </p>
                </div>
              )}
            </div>

            {/* Portfolio URL Display */}
            {deploymentStatus === "deployed" && portfolioUrl && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/40">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Your Portfolio URL
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex-1 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm text-slate-700 break-all">
                    {portfolioUrl}
                  </div>
                  <button
                    onClick={copyPortfolioUrl}
                    className="px-4 sm:px-6 py-2 sm:py-3 cursor-pointer bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base shrink-0"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4">
              {deploymentStatus === "ready" && (
                <button
                  onClick={deployPortfolio}
                  disabled={isDeploying}
                  className="group bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 w-full"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 animate-spin" />
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 group-hover:animate-pulse" />
                      <span className="hidden sm:inline">Deploy Portfolio</span>
                      <span className="sm:hidden">Deploy</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}

              {/* Disabled Deploy Button for Edge Cases */}
              {(deploymentStatus === "profile-and-template-required" ||
                deploymentStatus === "profile-required" ||
                deploymentStatus === "template-required") && (
                <button
                  disabled={true}
                  className="group bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl cursor-not-allowed opacity-50 font-bold text-sm sm:text-base lg:text-lg shadow-2xl flex items-center justify-center w-full"
                >
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                  <span className="hidden sm:inline">Deploy Portfolio</span>
                  <span className="sm:hidden">Deploy</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </button>
              )}

              {/* Action buttons for different edge cases */}
              {deploymentStatus === "profile-and-template-required" && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => (window.location.href = "/profile")}
                    className="cursor-pointer group bg-gradient-to-r from-orange-600 to-red-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-orange-700 hover:to-red-800 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105 flex-1"
                  >
                    <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                    <span className="hidden sm:inline">Complete Profile</span>
                    <span className="sm:hidden">Profile</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => (window.location.href = "/templates")}
                    className="group cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105 flex-1"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                    <span className="hidden sm:inline">Select Template</span>
                    <span className="sm:hidden">Template</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {deploymentStatus === "profile-required" && (
                <button
                  onClick={() => (window.location.href = "/profile")}
                  className="group cursor-pointer bg-gradient-to-r from-orange-600 to-red-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-orange-700 hover:to-red-800 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105 w-full"
                >
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                  <span className="hidden sm:inline">Complete Profile</span>
                  <span className="sm:hidden">Profile</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {deploymentStatus === "template-required" && (
                <button
                  onClick={() => (window.location.href = "/templates")}
                  className="group cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105 w-full"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                  <span className="hidden sm:inline">Select Template</span>
                  <span className="sm:hidden">Template</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Deployed State Buttons - Three in a row on large screens */}
              {deploymentStatus === "deployed" && (
                <>
                  {/* Primary Action - View Live Portfolio */}
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105 w-full"
                  >
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                    <span className="hidden sm:inline">
                      View Live Portfolio
                    </span>
                    <span className="sm:hidden">View Live</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Secondary Actions - Row layout on large screens */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={unpublishPortfolio}
                      className="bg-white/80 backdrop-blur-sm border-2 cursor-pointer border-slate-300 text-slate-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-white hover:border-slate-400 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105 flex-1"
                    >
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                      <span className="hidden sm:inline">
                        Unpublish Portfolio
                      </span>
                      <span className="sm:hidden">Unpublish</span>
                    </button>

                    <button
                      onClick={redeployPortfolio}
                      disabled={isDeploying}
                      className="bg-white/80 backdrop-blur-sm border-2 cursor-pointer border-blue-300 text-blue-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 transform hover:scale-105 flex-1"
                    >
                      {isDeploying ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                      )}
                      <span className="hidden sm:inline">
                        Redeploy Portfolio
                      </span>
                      <span className="sm:hidden">Update</span>
                    </button>
                  </div>
                </>
              )}

              {deploymentStatus === "error" && (
                <button
                  onClick={checkDeploymentStatus}
                  className="group bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105 w-full"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  Try Again
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {deploymentStatus === "no-template" && (
                <button
                  onClick={checkDeploymentStatus}
                  className="group bg-gradient-to-r from-blue-600 cursor-pointer to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105 w-full"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  Try Again
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
            <button
              onClick={() => (window.location.href = "/profile")}
              className="cursor-pointer group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0">
                <Edit3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-2 sm:mb-3 text-center sm:text-left">
                Edit Profile
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-center sm:text-left">
                Update your information and redeploy with fresh content
              </p>
            </button>

            <button
              onClick={() => (window.location.href = "/templates")}
              className="cursor-pointer group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0">
                <Settings className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-2 sm:mb-3 text-center sm:text-left">
                Change Template
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-center sm:text-left">
                Switch to a different design that matches your style
              </p>
            </button>

            <button
              onClick={() =>
                portfolioUrl && window.open(portfolioUrl, "_blank")
              }
              disabled={!portfolioUrl}
              className="cursor-pointer group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0">
                <Eye className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-2 sm:mb-3 text-center sm:text-left">
                View Live
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-center sm:text-left">
                See your portfolio in action and share it with others
              </p>
            </button>
          </div>

          {/* Statistics Cards */}
          {deploymentStatus === "deployed" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-xs sm:text-sm font-medium">
                      Deployment Time
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">
                      {"< 2 min"}
                    </p>
                  </div>
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-xs sm:text-sm font-medium">
                      Performance
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">
                      Optimized
                    </p>
                  </div>
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-xs sm:text-sm font-medium">
                      Accessibility
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">
                      100%
                    </p>
                  </div>
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <Footer />
      </div>
      <Toaster position="top-center" reverseOrder={true} />
    </>
  );
};

export default PortfolioDeployment;
