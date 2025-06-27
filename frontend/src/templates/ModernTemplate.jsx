import React, { useState, useEffect } from 'react';
import {
  MapPin, Phone, Mail, Github, Linkedin, Twitter, ExternalLink,
  Download, Calendar, Building, GraduationCap, Award, Star,
  Code, Briefcase, User, Globe, ChevronRight, ArrowUpRight,
  Clock, Users, Zap, Target, Eye, Heart, X, Send, Palette, Figma, Link
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ModernTemplate = ({ userData }) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Fixed comprehensive validation helpers based on actual data structure
  const hasBasicInfo = userData?.firstName || userData?.lastName || userData?.email;
  const hasTitle = userData?.professional?.title;
  const hasSummary = userData?.professional?.summary;
  const hasSkills = userData?.professional?.skills?.length > 0;
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasProjects = userData?.projects?.length > 0;
  const hasCertifications = userData?.certifications?.length > 0;
  const hasSocialLinks = userData?.personalInfo?.socialLinks &&
    (userData?.personalInfo?.socialLinks?.linkedin ||
      userData?.personalInfo?.socialLinks?.github ||
      userData?.personalInfo?.socialLinks?.twitter ||
      userData?.personalInfo?.socialLinks?.website ||
      userData?.personalInfo?.socialLinks?.portfolio ||
      userData?.personalInfo?.socialLinks?.behance ||
      userData?.personalInfo?.socialLinks?.dribbble ||
      userData?.personalInfo?.socialLinks?.other);
  const hasContactInfo = userData?.personalInfo?.phone ||
    userData?.personalInfo?.location ||
    userData?.email;

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Setting up API configuration
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    // Store config for later use
    window.apiConfig = {
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
  }, [API_BASE_URL]);

  // Helper function to ensure URLs have proper protocol
  const ensureHttpProtocol = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  // Modal handlers
  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSend = async () => {
    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
      toast('Please fill in all required fields.', {
        icon: 'ℹ️',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast('Please enter a valid email address.', {
        icon: 'ℹ️',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Submission data
      const portfolioContactData = {
        ...formData,
        ownerDetail: userData?.username
      };

      const config = window.apiConfig || {};
      const response = await fetch(`${config.baseURL || ''}/email/contact`, {
        method: 'POST',
        headers: config.headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioContactData })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Thank you! Your message has been sent successfully.');
        closeModal();
      } else {
        toast.error(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred while sending your message. Please try again later.');
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

  // Reusable Components
  const Section = ({ children, className = "" }) => (
    <section className={`mb-16 sm:mb-20 ${className}`}>{children}</section>
  );

  const SectionTitle = ({ icon: Icon, title, subtitle, gradient = "from-blue-500 to-purple-600" }) => (
    <div className="text-center mb-12 sm:mb-16">
      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg mb-4 sm:mb-6`}>
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">{title}</h2>
      {subtitle && <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">{subtitle}</p>}
    </div>
  );

  const SkillCard = ({ skill, level = 85, category = "Technical" }) => (
    <div className="group relative bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base break-words flex-1">{skill}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">{category}</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Proficiency</span>
          <span className="font-medium text-gray-900">{level}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${level}%` }}
          ></div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );

  const ExperienceCard = ({ experience, index }) => (
    <div className="relative group">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-blue-300 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2">
        <div className="absolute -left-4 sm:-left-6 top-6 sm:top-8 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs sm:text-sm">{index + 1}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors break-words">
              {experience.title}
            </h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-gray-600 mb-3">
              <div className="flex items-center">
                <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="font-medium break-words">{experience.company}</span>
              </div>
              {experience.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="break-words">{experience.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm text-gray-700 font-medium flex-shrink-0">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="break-words">
              {formatDate(experience.startDate)} - {experience.current ? 'Present' : formatDate(experience.endDate)}
            </span>
          </div>
        </div>

        {experience.description && (
          <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">{experience.description}</p>
        )}

        {experience.achievements && experience.achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Key Achievements</h4>
            {experience.achievements.map((achievement, idx) => (
              <div key={idx} className="flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{achievement}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ProjectCard = ({ project }) => (
    <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-blue-300 overflow-hidden transition-all duration-300 hover:-translate-y-2">
      {project.image && (
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
          <img
            src={project.image}
            alt={project.title || 'Project'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between mb-4 gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors break-words flex-1">
            {project.title || 'Untitled Project'}
          </h3>
          {project.featured && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-medium flex items-center flex-shrink-0">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </span>
          )}
        </div>

        {project.description && (
          <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{project.description}</p>
        )}

        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {project.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium break-words"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {project.url && (
            <a
              href={ensureHttpProtocol(project.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={ensureHttpProtocol(project.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm sm:text-base"
            >
              <Github className="w-4 h-4 mr-2 flex-shrink-0" />
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const EducationCard = ({ education }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{education.degree || 'Degree'}</h3>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-gray-600">
            <div className="flex items-center">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="font-medium break-words">{education.school || education.institution || 'Institution'}</span>
            </div>
            {education.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="break-words">{education.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 text-green-800 text-xs sm:text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 text-center">
          <span className="break-words">
            {formatDate(education.startDate)} - {formatDate(education.endDate) || 'Present'}
          </span>
        </div>
      </div>

      {education.description && (
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">{education.description}</p>
      )}

      {education.gpa && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Grade: </span>{education.gpa}
        </div>
      )}
    </div>
  );

  const CertificationCard = ({ certification }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-purple-300 p-4 sm:p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3 gap-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words flex-1">{certification.name || 'Certification'}</h3>
        {certification.badge && (
          <img src={certification.badge} alt="Badge" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0" />
        )}
      </div>

      <p className="text-gray-600 mb-3 text-sm sm:text-base break-words">{certification.issuer || 'Issuer'}</p>

      <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3">
        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
        <span className="break-words">
          {certification.issueDate && formatDate(certification.issueDate)}
          {certification.expiryDate && ` - ${formatDate(certification.expiryDate)}`}
        </span>
      </div>

      {certification.credentialUrl && (
        <a
          href={ensureHttpProtocol(certification.credentialUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
        >
          View Credential
          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 flex-shrink-0" />
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 left-20 sm:top-40 sm:left-40 w-40 h-40 sm:w-80 sm:h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-700/20"></div>

        <div className="relative z-10 max-w-6xl mx-auto py-16 sm:py-20 text-center">
          {/* Profile Photo */}
          {userData?.profilePhoto && (
            <div className="mb-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                <img
                  src={userData.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Name and Title */}
          {hasBasicInfo && (
            <div className="mb-6 sm:mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 leading-tight pb-2 break-words">
                {userData?.firstName && userData?.lastName
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData?.firstName || userData?.lastName || 'Professional Portfolio'
                }
              </h1>

              {hasTitle && (
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-700 font-light mb-4 sm:mb-6 break-words">
                  {userData.professional.title}
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          {hasSummary && (
            <div className="mb-8 sm:mb-12">
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {userData.professional.summary}
              </p>
            </div>
          )}

          {/* Contact Info */}
          {hasContactInfo && (
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10">
              {userData?.email && (
                <a
                  href={`mailto:${userData.email}`}
                  className="group flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-300 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm sm:text-base break-all">{userData.email}</span>
                </a>
              )}

              {userData?.personalInfo?.phone && (
                <a
                  href={`tel:${userData.personalInfo.phone}`}
                  className="group flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-300 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm sm:text-base">{userData.personalInfo.phone}</span>
                </a>
              )}

              {userData?.personalInfo?.location && (
                <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base break-words">{userData.personalInfo.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {hasSocialLinks && (
            <div className="flex justify-center space-x-3 sm:space-x-4 mb-8 sm:mb-12">
              {userData?.personalInfo?.socialLinks?.linkedin && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-300 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-blue-700" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.github && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-gray-400 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-gray-900" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.twitter && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-300 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 group-hover:text-blue-600" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.website && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-green-400 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label="Personal Website"
                >
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 group-hover:text-green-700" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.portfolio && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.portfolio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-purple-400 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label="Portfolio"
                >
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:text-purple-700" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.behance && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.behance)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-400 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label="Behance Profile"
                >
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-blue-700" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.dribbble && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.dribbble)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-pink-400 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label="Dribbble Profile"
                >
                  <Figma className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 group-hover:text-pink-700" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.other && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.other)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-gray-400 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label="Other Link"
                >
                  <Link className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-700" />
                </a>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r cursor-pointer from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-bounce flex-shrink-0" />
              Download Resume
            </button>

            <button
              onClick={openModal}
              className="border-2 border-white/80 text-gray-800 hover:bg-white/90 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center group backdrop-blur-sm text-sm sm:text-base cursor-pointer"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse flex-shrink-0" />
              Get In Touch
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:py-20">
        {/* Skills Section */}
        {hasSkills && (
          <Section>
            <SectionTitle
              icon={Code}
              title="Skills & Expertise"
              subtitle="Technologies and tools I work with to bring ideas to life"
              gradient="from-blue-500 to-cyan-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {userData.professional.skills.map((skill, index) => (
                <SkillCard
                  key={index}
                  skill={skill}
                  level={Math.floor(Math.random() * 20) + 80} // Random level between 80-100
                  category={index % 3 === 0 ? 'Frontend' : index % 3 === 1 ? 'Backend' : 'Tools'}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Experience Section */}
        {hasExperience && (
          <Section>
            <SectionTitle
              icon={Briefcase}
              title="Professional Journey"
              subtitle="My career path and the impact I've made along the way"
              gradient="from-purple-500 to-pink-500"
            />
            <div className="relative">
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
              <div className="space-y-8 sm:space-y-12 ml-8 sm:ml-16">
                {userData.experience.map((exp, index) => (
                  <ExperienceCard key={index} experience={exp} index={index} />
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Projects Section */}
        {hasProjects && (
          <Section>
            <SectionTitle
              icon={Award}
              title="Featured Projects"
              subtitle="A showcase of my recent work and creative solutions"
              gradient="from-green-500 to-blue-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {userData.projects.map((project, index) => (
                <ProjectCard key={index} project={project} />
              ))}
            </div>
          </Section>
        )}

        {/* Education Section */}
        {hasEducation && (
          <Section>
            <SectionTitle
              icon={GraduationCap}
              title="Education"
              subtitle="Academic foundation and continuous learning journey"
              gradient="from-indigo-500 to-purple-500"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {userData.education.map((edu, index) => (
                <EducationCard key={index} education={edu} />
              ))}
            </div>
          </Section>
        )}

        {/* Certifications Section */}
        {hasCertifications && (
          <Section>
            <SectionTitle
              icon={Award}
              title="Certifications"
              subtitle="Professional credentials and achievements"
              gradient="from-yellow-500 to-orange-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {userData.certifications.map((cert, index) => (
                <CertificationCard key={index} certification={cert} />
              ))}
            </div>
          </Section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Let's Create Something Amazing Together</h3>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              I'm always excited to take on new challenges and collaborate with innovative teams.
              Let's discuss how we can bring your ideas to life.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
            <button
              onClick={openModal}
              className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group text-sm sm:text-base cursor-pointer"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse flex-shrink-0" />
              Start a Conversation
            </button>

            <button
              onClick={() => window.print()}
              className="border-2 border-gray-600 hover:bg-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all font-semibold flex items-center justify-center group text-sm sm:text-base cursor-pointer"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-bounce flex-shrink-0" />
              Download Resume
            </button>
          </div>

          {/* Social Links Footer */}
          {hasSocialLinks && (
            <div className="flex justify-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
              {userData?.personalInfo?.socialLinks?.linkedin && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-blue-600 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.github && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-gray-700 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.twitter && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-blue-500 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.website && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-green-600 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                  aria-label="Personal Website"
                >
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.portfolio && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.portfolio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-purple-600 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                  aria-label="Portfolio"
                >
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.behance && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.behance)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-blue-600 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                  aria-label="Behance Profile"
                >
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.dribbble && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.dribbble)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-pink-600 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                  aria-label="Dribbble Profile"
                >
                  <Figma className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white" />
                </a>
              )}

              {userData?.personalInfo?.socialLinks?.other && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.other)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-gray-600 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                  aria-label="Other Link"
                >
                  <Link className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white" />
                </a>
              )}
            </div>
          )}

          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <p className="text-gray-400 text-sm sm:text-base break-words">
              © {new Date().getFullYear()} {userData?.firstName && userData?.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : 'Professional Portfolio'}.
              Crafted with passion and attention to detail.
            </p>
          </div>
        </div>
      </footer>

      {/* Contact Modal - Modern Style */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={handleModalClick}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full mx-auto shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-indigo-50/80"></div>

            {/* Modal Header */}
            <div className="relative z-10 p-6 sm:p-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Let's Connect</h3>
                    <p className="text-gray-600 text-sm">I'd love to hear about your project</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className={`text-gray-400 hover:text-gray-600 transition-colors rounded-xl p-2 hover:bg-gray-100 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Sending your message...</p>
                </div>
              </div>
            )}

            <div className="relative z-10 px-6 sm:px-8 pb-6 sm:pb-8">
              {/* Contact Form */}
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    placeholder="What's your name?"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    placeholder="What's your email?"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    rows={4}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    placeholder="What's your message?"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center ${isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 cursor-pointer hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin mr-3"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Send Message
                    </>
                  )}
                </button>
              </div>

              {/* Direct Email */}
              {userData?.email && !isLoading && (
                <div className="mt-6 pt-6 border-t border-gray-200/60 text-center">
                  <p className="text-sm text-gray-600 mb-3">Or reach out directly:</p>
                  <a
                    href={`mailto:${userData.email}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
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

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        /* Print Styles */
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-break {
            page-break-before: always;
          }
          
          body {
            background: white !important;
          }
          
          .bg-gradient-to-br,
          .bg-gradient-to-r {
            background: white !important;
            color: black !important;
          }
          
          .text-white {
            color: black !important;
          }
          
          .shadow-lg,
          .shadow-xl,
          .shadow-2xl {
            box-shadow: none !important;
          }
        }
        
        /* Responsive Typography */
        @media (max-width: 640px) {
          .text-5xl { font-size: 2.5rem; }
          .text-7xl { font-size: 3.5rem; }
          .text-8xl { font-size: 4rem; }
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
        
        /* Smooth Scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Focus Styles for Accessibility */
        a:focus,
        button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          .bg-white\/80 {
            background-color: white;
          }
          
          .text-gray-600 {
            color: #000;
          }
          
          .border-gray-200 {
            border-color: #000;
          }
        }
        
        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .animate-blob,
          .animate-bounce,
          .animate-pulse,
          .animate-float,
          .animate-gradient {
            animation: none;
          }
          
          .transition-all,
          .transition-colors,
          .transition-transform {
            transition: none;
          }
          
          .hover\\:scale-105:hover,
          .hover\\:scale-110:hover,
          .hover\\:-translate-y-1:hover,
          .hover\\:-translate-y-2:hover {
            transform: none;
          }
        }
      `}</style>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  );
};

export default ModernTemplate;