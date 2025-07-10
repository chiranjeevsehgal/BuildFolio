import React, { useEffect, useState } from "react";
import {
  ExternalLink,
  Github,
  Star,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Globe,
  Calendar,
  Building,
  GraduationCap,
  Award,
  X,
  Send,
  Palette,
  Figma,
  Link,
  Briefcase,
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const CreativeGradientTemplate = ({ userData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Fixed validation helpers based on actual data structure
  const hasBasicInfo = userData?.firstName || userData?.lastName;
  const hasTitle = userData?.professional?.title;
  const hasSummary = userData?.professional?.summary;
  const hasContactInfo =
    userData?.personalInfo?.phone ||
    userData?.personalInfo?.location ||
    userData?.email;
  const hasSocialLinks =
    userData?.personalInfo?.socialLinks &&
    (userData?.personalInfo?.socialLinks?.linkedin ||
      userData?.personalInfo?.socialLinks?.github ||
      userData?.personalInfo?.socialLinks?.twitter ||
      userData?.personalInfo?.socialLinks?.website ||
      userData?.personalInfo?.socialLinks?.portfolio ||
      userData?.personalInfo?.socialLinks?.behance ||
      userData?.personalInfo?.socialLinks?.dribbble ||
      userData?.personalInfo?.socialLinks?.other);
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasCertifications = userData?.certifications?.length > 0;

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Setting up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common["Content-Type"] = "application/json";

    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [API_BASE_URL]);

  // Helper function to ensure URLs have proper protocol
  const ensureHttpProtocol = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return dateString;
    }
  };

  // Modal handlers
  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", message: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSend = async () => {
    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
      toast("Please fill in all required fields.", {
        icon: "ℹ️",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast("Please enter a valid email address.", {
        icon: "ℹ️",
      });

      return;
    }

    setIsLoading(true);

    try {
      // Submission data
      const portfolioContactData = {
        ...formData,
        ownerDetail: userData?.username,
      };

      const response = await axios.post("/email/contact", {
        portfolioContactData,
      });

      const result = response.data;

      if (result.success) {
        toast.success("Thank you! Your message has been sent successfully.");
        closeModal();
      } else {
        toast.error(
          result.message || "Failed to send message. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        "An error occurred while sending your message. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClick = (e) => {
    // Close modal if clicking on backdrop
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      {/* Hero */}
      <header className="min-h-screen flex items-center justify-center text-white relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-20 left-20 sm:top-40 sm:left-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Profile Photo */}
          {userData?.profilePhoto && (
            <div className="mb-6 mt-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                <img
                  src={userData.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {hasBasicInfo && (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-300 leading-tight">
                {userData?.firstName || "Creative"}
              </h1>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
                {userData?.lastName || "Professional"}
              </h2>
            </>
          )}

          {hasTitle && (
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-pink-200 mb-6 sm:mb-8 px-4">
              {userData.professional.title}
            </p>
          )}

          {hasSummary && (
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
              {userData.professional.summary}
            </p>
          )}

          {/* Contact Info */}
          {hasContactInfo && (
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 text-sm px-4">
              {userData?.email && (
                <a
                  href={`mailto:${userData.email}`}
                  className="flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-full px-4 py-2 transition-all duration-300 text-center"
                >
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{userData.email}</span>
                </a>
              )}
              {userData?.personalInfo?.phone && (
                <a
                  href={`tel:${userData.personalInfo.phone}`}
                  className="flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-full px-4 py-2 transition-all duration-300"
                >
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{userData.personalInfo.phone}</span>
                </a>
              )}
              {userData?.personalInfo?.location && (
                <div className="flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {userData.personalInfo.location}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {hasSocialLinks && (
            <div className="flex justify-center space-x-4 sm:space-x-6 px-4 mb-4">
              {userData?.personalInfo?.socialLinks?.linkedin && (
                <a
                  href={ensureHttpProtocol(
                    userData.personalInfo.socialLinks.linkedin,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.github && (
                <a
                  href={ensureHttpProtocol(
                    userData.personalInfo.socialLinks.github,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.twitter && (
                <a
                  href={ensureHttpProtocol(
                    userData.personalInfo.socialLinks.twitter,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.website && (
                <a
                  href={ensureHttpProtocol(
                    userData.personalInfo.socialLinks.website,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="Personal Website"
                >
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.portfolio && (
                <a
                  href={ensureHttpProtocol(
                    userData.personalInfo.socialLinks.portfolio,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="Portfolio"
                >
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.behance && (
                <a
                  href={ensureHttpProtocol(
                    userData.personalInfo.socialLinks.behance,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="Behance Profile"
                >
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.dribbble && (
                <a
                  href={ensureHttpProtocol(
                    userData.personalInfo.socialLinks.dribbble,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="Dribbble Profile"
                >
                  <Figma className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.other && (
                <a
                  href={ensureHttpProtocol(
                    userData.personalInfo.socialLinks.other,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="Other Link"
                >
                  <Link className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="bg-white">
        {/* Creative Skills Grid */}
        {hasSkills && (
          <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-900">
                My Superpowers
              </h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {userData.professional.skills.map((skill, index) => {
                  const gradients = [
                    "from-purple-500 to-pink-500",
                    "from-pink-500 to-red-500",
                    "from-red-500 to-orange-500",
                    "from-orange-500 to-yellow-500",
                    "from-yellow-500 to-green-500",
                    "from-green-500 to-blue-500",
                    "from-blue-500 to-indigo-500",
                    "from-indigo-500 to-purple-500",
                  ];
                  return (
                    <div
                      key={index}
                      className={`bg-gradient-to-r ${gradients[index % gradients.length]} p-4 sm:p-6 rounded-2xl text-white text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <h3 className="font-bold text-sm sm:text-base lg:text-lg break-words">
                        {skill}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {hasExperience && (
          <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-900">
                My Journey
              </h2>
              <div className="space-y-6 sm:space-y-8">
                {userData.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="mb-4 lg:mb-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                          {exp.title || "Position"}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-gray-600">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500 flex-shrink-0" />
                            <span className="font-medium">
                              {exp.company || "Company"}
                            </span>
                          </div>
                          {exp.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500 flex-shrink-0" />
                              <span>{exp.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-center flex-shrink-0">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                        <span className="break-words">
                          {formatDate(exp.startDate)} -{" "}
                          {exp.current ? "Present" : formatDate(exp.endDate)}
                        </span>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start">
                            <Star className="w-4 h-4 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-700 text-sm sm:text-base">
                              {achievement}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects Showcase */}
        {hasProjects && (
          <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-900">
                Featured Work
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {userData.projects.map((project, index) => {
                  const gradients = [
                    "from-purple-400 to-pink-400",
                    "from-pink-400 to-red-400",
                    "from-red-400 to-orange-400",
                    "from-orange-400 to-yellow-400",
                    "from-yellow-400 to-green-400",
                    "from-green-400 to-blue-400",
                  ];
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      {project.image ? (
                        <div className="h-40 sm:h-48 overflow-hidden">
                          <img
                            src={project.image}
                            alt={project.title || "Project"}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div
                          className={`h-40 sm:h-48 bg-gradient-to-r ${gradients[index % gradients.length]} flex items-center justify-center`}
                        >
                          <h3 className="text-white font-bold text-lg sm:text-xl text-center px-4 break-words">
                            {project.title || "Untitled Project"}
                          </h3>
                        </div>
                      )}
                      <div className="p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 break-words">
                          {project.title || "Untitled Project"}
                        </h3>
                        {project.description && (
                          <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                            {project.description}
                          </p>
                        )}
                        {project.skills && project.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-2 py-1 rounded-full break-words"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          {project.url && (
                            <a
                              href={ensureHttpProtocol(project.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-medium"
                            >
                              <ExternalLink className="w-4 h-4 mr-1 flex-shrink-0" />
                              Live Demo
                            </a>
                          )}
                          {project.githubUrl && (
                            <a
                              href={ensureHttpProtocol(project.githubUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-sm font-medium"
                            >
                              <Github className="w-4 h-4 mr-1 flex-shrink-0" />
                              Code
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {hasEducation && (
          <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-900">
                Education
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {userData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-purple-200 hover:shadow-lg transition-shadow duration-300"
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
                      {edu.degree || "Degree"}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500 flex-shrink-0" />
                      <span className="font-medium break-words">
                        {edu.school || edu.institution || "Institution"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        {formatDate(edu.startDate)} -{" "}
                        {formatDate(edu.endDate) || "Present"}
                      </span>
                    </div>
                    {edu.description && (
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {edu.description}
                      </p>
                    )}
                    {edu.gpa && (
                      <p className="text-purple-600 font-medium mt-2 text-sm sm:text-base">
                        Grade: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {hasCertifications && (
          <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-900">
                Certifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userData.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words flex-1 mr-2">
                        {cert.name || "Certification"}
                      </h3>
                      {cert.badge && (
                        <img
                          src={cert.badge}
                          alt="Badge"
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-purple-600 font-medium mb-3 text-sm sm:text-base break-words">
                      {cert.issuer || "Issuer"}
                    </p>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-4">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                      <span className="break-words">
                        {cert.issueDate && formatDate(cert.issueDate)}
                        {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                      </span>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={ensureHttpProtocol(cert.credentialUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-xs sm:text-sm break-words"
                      >
                        <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl pb-2 md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Let's Create Magic Together
            </h3>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Ready to bring your wildest ideas to life? Let's collaborate and
              make something extraordinary!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12 px-4">
            <button
              onClick={openModal}
              className="bg-gradient-to-r cursor-pointer from-purple-500 to-pink-500 px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group text-sm sm:text-base"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse flex-shrink-0" />
              Start a Conversation
            </button>

            <button
              onClick={() => window.print()}
              className="border-2 border-gray-600 cursor-pointer hover:bg-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all font-semibold flex items-center justify-center group text-sm sm:text-base"
            >
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-bounce flex-shrink-0" />
              Download Resume
            </button>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <p className="text-gray-400 text-sm sm:text-base px-4">
              © {new Date().getFullYear()}{" "}
              {hasBasicInfo
                ? `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim()
                : "Creative Professional"}
              . Designed with passion and creativity.
            </p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-xl shadow-4xl shadow-gray-800 flex items-center justify-center z-50 p-4"
          onClick={handleModalClick}
        >
          <div className="bg-white rounded-2xl max-w-md w-full mx-auto shadow-2xl animate-pulse-once relative overflow-hidden">
            {/* Modal gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 opacity-60"></div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600 text-sm font-medium">
                    Sending your message...
                  </p>
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={closeModal}
              disabled={isLoading}
              className={`absolute top-4 right-4 z-20 rounded-full p-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
                isLoading
                  ? "bg-gray-200 cursor-not-allowed opacity-50"
                  : "bg-white/80 hover:bg-white cursor-pointer"
              }`}
              aria-label="Close modal"
            >
              <X
                className={`w-5 h-5 ${isLoading ? "text-gray-400" : "text-gray-600"}`}
              />
            </button>

            <div className="relative z-10 p-6 sm:p-8">
              {/* Modal Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  Let's Connect
                </h3>
                <p className="text-gray-600">
                  Ready to start something amazing together?
                </p>
              </div>

              {/* Contact Form */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="What's your name?"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="What's your email?"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    rows={4}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="What's your message?"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 cursor-pointer"
                  } text-white`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                      Send Message
                    </>
                  )}
                </button>
              </form>

              {/* Email */}
              {userData?.email && !isLoading && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Or reach out directly:
                  </p>
                  <a
                    href={`mailto:${userData.email}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors duration-300"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {userData.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Custom Styles */}
      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-pulse-once {
          animation: pulse-once 0.3s ease-in-out;
        }
        
        @keyframes pulse-once {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @media (max-width: 480px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-bounce,
          .animate-ping,
          .animate-pulse-once {
            animation: none;
          }
          
          .transition-all,
          .transition-colors,
          .transition-transform,
          .transition-shadow {
            transition: none;
          }
          
          .hover\\:scale-105:hover,
          .hover\\:scale-110:hover,
          .hover\\:-translate-y-2:hover,
          .group-hover\\:translate-x-1 {
            transform: none;
          }
        }
      `}</style>
      <Toaster position="top-center" reverseOrder={true} />
    </div>
  );
};

export default CreativeGradientTemplate;
