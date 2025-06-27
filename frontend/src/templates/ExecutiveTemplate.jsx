import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Linkedin, Building, Calendar, GraduationCap, Award, Users, TrendingUp, Globe, Twitter, Github, ExternalLink, Star, Briefcase, X, Send, Palette, Figma, Link } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ExecutiveTemplate = ({ userData }) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Fixed validation helpers based on actual data structure
  const hasBasicInfo = userData?.firstName || userData?.lastName;
  const hasTitle = userData?.professional?.title;
  const hasSummary = userData?.professional?.summary;
  const hasContactInfo = userData?.personalInfo?.phone || userData?.personalInfo?.location || userData?.email;
  const hasSocialLinks = userData?.personalInfo?.socialLinks &&
    (userData?.personalInfo?.socialLinks?.linkedin ||
      userData?.personalInfo?.socialLinks?.github ||
      userData?.personalInfo?.socialLinks?.twitter ||
      userData?.personalInfo?.socialLinks?.website ||
      userData?.personalInfo?.socialLinks?.portfolio ||
      userData?.personalInfo?.socialLinks?.behance ||
      userData?.personalInfo?.socialLinks?.dribbble ||
      userData?.personalInfo?.socialLinks?.other);
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;
  const hasCertifications = userData?.certifications?.length > 0;

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Setting up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
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
        month: 'long'
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

      const response = await axios.post('/email/contact', {
        portfolioContactData
      });

      const result = response.data;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Executive Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8 xl:space-x-12">
            {/* Profile Photo */}
            <div className="flex-shrink-0 self-center lg:self-start">
              {userData?.profilePhoto ? (
                <img
                  src={userData.profilePhoto}
                  alt="Professional Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-xl border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl border-4 border-gray-200">
                  <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                    {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Executive Info */}
            <div className="flex-1 text-center lg:text-left">
              {hasBasicInfo && (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 break-words">
                  {userData?.firstName && userData?.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData?.firstName || userData?.lastName || 'Executive Professional'
                  }
                </h1>
              )}

              {hasTitle && (
                <p className="text-lg sm:text-xl lg:text-2xl text-blue-600 font-semibold mb-4 sm:mb-6 break-words">{userData.professional.title}</p>
              )}

              {hasSummary && (
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6 max-w-4xl mx-auto lg:mx-0">
                  {userData.professional.summary}
                </p>
              )}

              {/* Contact Information */}
              {hasContactInfo && (
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 lg:gap-6 text-gray-600 mb-4 sm:mb-6 justify-center lg:justify-start">
                  {userData?.personalInfo?.location && (
                    <div className="flex items-center justify-center lg:justify-start bg-gray-100 px-3 sm:px-4 py-2 rounded-full">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base break-words">{userData.personalInfo.location}</span>
                    </div>
                  )}
                  {userData?.email && (
                    <a
                      href={`mailto:${userData.email}`}
                      className="flex items-center justify-center lg:justify-start bg-gray-100 hover:bg-blue-50 px-3 sm:px-4 py-2 rounded-full transition-colors"
                    >
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base break-all">{userData.email}</span>
                    </a>
                  )}
                  {userData?.personalInfo?.phone && (
                    <a
                      href={`tel:${userData.personalInfo.phone}`}
                      className="flex items-center justify-center lg:justify-start bg-gray-100 hover:bg-blue-50 px-3 sm:px-4 py-2 rounded-full transition-colors"
                    >
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">{userData.personalInfo.phone}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Social Links */}
              {hasSocialLinks && (
                <div className="flex justify-center lg:justify-start space-x-3 sm:space-x-4">
                  {userData?.personalInfo?.socialLinks?.linkedin && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.github && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 hover:bg-gray-900 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg"
                      aria-label="GitHub Profile"
                    >
                      <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.twitter && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-400 hover:bg-blue-500 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg"
                      aria-label="Twitter Profile"
                    >
                      <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.website && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg"
                      aria-label="Personal Website"
                    >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.portfolio && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-700 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg"
                      aria-label="Portfolio"
                    >
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.behance && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.behance)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg"
                      aria-label="Behance Profile"
                    >
                      <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.dribbble && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.dribbble)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-pink-600 hover:bg-pink-700 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg"
                      aria-label="Dribbble Profile"
                    >
                      <Figma className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.other && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.other)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-600 hover:bg-orange-700 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg"
                      aria-label="Other Link"
                    >
                      <Link className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Executive Overview Stats */}
        {(hasEducation || hasProjects || hasSkills) && (
          <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              <span className="break-words">Professional Overview</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {hasProjects && (
                <div className="text-center bg-green-50 rounded-lg p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{userData.projects.length}</div>
                  <div className="text-gray-600 font-medium text-sm sm:text-base">Key Projects</div>
                </div>
              )}
              {hasSkills && (
                <div className="text-center bg-purple-50 rounded-lg p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">{userData.professional.skills.length}</div>
                  <div className="text-gray-600 font-medium text-sm sm:text-base">Core Skills</div>
                </div>
              )}
              {hasEducation && (
                <div className="text-center bg-orange-50 rounded-lg p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">{userData.education.length}</div>
                  <div className="text-gray-600 font-medium text-sm sm:text-base">Education</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Core Competencies */}
        {hasSkills && (
          <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              <span className="break-words">Core Competencies</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {userData.professional.skills.map((skill, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                  <span className="font-semibold text-blue-800 text-sm sm:text-base break-words">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {hasExperience && (
          <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              <span className="break-words">Professional Experience</span>
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {userData.experience.map((exp, index) => (
                <div key={index} className="relative">
                  {/* Timeline connector */}
                  {index !== userData.experience.length - 1 && (
                    <div className="absolute left-5 sm:left-6 top-12 w-0.5 h-full bg-blue-200 hidden sm:block"></div>
                  )}

                  <div className="flex items-start space-x-4 sm:space-x-6">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-lg p-4 sm:p-6 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{exp.title || 'Position'}</h3>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-gray-600">
                            <div className="flex items-center font-semibold">
                              <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                              <span className="break-words">{exp.company || 'Company'}</span>
                            </div>
                            {exp.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="break-words">{exp.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 sm:px-4 py-2 rounded-full font-semibold text-sm sm:text-base flex-shrink-0 text-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                          <span className="break-words">
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>

                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">{exp.description}</p>
                      )}

                      {exp.achievements && exp.achievements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Key Achievements</h4>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, idx) => (
                              <li key={idx} className="flex items-start">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-700 text-sm sm:text-base">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Projects */}
        {hasProjects && (
          <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              <span className="break-words">Key Projects & Initiatives</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {userData.projects.map((project, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words flex-1">{project.title || 'Untitled Project'}</h3>
                    {project.featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0">
                        Featured
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{project.description}</p>
                  )}

                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm font-medium break-words">
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
                        className="flex items-center justify-center sm:justify-start text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1 flex-shrink-0" />
                        View Project
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={ensureHttpProtocol(project.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center sm:justify-start text-gray-600 hover:text-gray-800 font-medium text-sm"
                      >
                        <Github className="w-4 h-4 mr-1 flex-shrink-0" />
                        Source Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Education */}
          {hasEducation && (
            <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                <span className="break-words">Education</span>
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {userData.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4 sm:pl-6 pb-4 sm:pb-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-words">
                      {edu.degree || 'Degree'}
                    </h3>
                    <div className="text-blue-600 font-semibold mb-2 text-sm sm:text-base break-words">
                      {edu.school || edu.institution || 'Institution'}
                    </div>
                    <div className="flex items-center text-gray-600 mb-3 text-sm sm:text-base">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="break-words">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}
                      </span>
                    </div>
                    {edu.location && (
                      <div className="flex items-center text-gray-600 mb-3 text-sm sm:text-base">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="break-words">{edu.location}</span>
                      </div>
                    )}
                    {edu.gpa && (
                      <div className="text-gray-700 mb-2 text-sm sm:text-base">
                        <span className="font-medium">Grade:</span> {edu.gpa}
                      </div>
                    )}
                    {edu.description && (
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {hasCertifications && (
            <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                <span className="break-words">Certifications</span>
              </h2>
              <div className="space-y-4">
                {userData.certifications.map((cert, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base break-words flex-1">{cert.name || 'Certification'}</h3>
                      {cert.badge && (
                        <img src={cert.badge} alt="Badge" className="w-10 h-10 sm:w-12 sm:h-12 rounded flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-blue-600 font-semibold mb-2 text-sm sm:text-base break-words">{cert.issuer || 'Issuer'}</p>
                    <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-3">
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
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Executive Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Let's Connect</h3>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
              Open to executive opportunities and strategic partnerships.
              Let's discuss how we can drive success together.
            </p>
          </div>


          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 sm:mb-8">

            {userData?.email && (
              <button
                onClick={openModal}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 px-6 sm:px-8 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center text-sm sm:text-base"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Get in Touch
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="border-2 border-gray-600 hover:bg-gray-800 px-6 sm:px-8 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center text-sm sm:text-base cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              Download Executive Resume
            </button>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <p className="text-gray-400 text-sm sm:text-base">
              © {new Date().getFullYear()} {hasBasicInfo
                ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
                : 'Executive Professional'}.
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Contact Modal - Executive Style */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleModalClick}
        >
          <div className="bg-white rounded-xl max-w-lg w-full mx-auto shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 relative">
              <button
                onClick={closeModal}
                disabled={isLoading}
                className={`absolute top-4 right-4 text-white/80 hover:text-white transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="pr-8">
                <h3 className="text-2xl font-bold mb-2">Let's Get in Touch</h3>
                <p className="text-blue-100">I'm eager to connect and discuss how we might work together.</p>
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

            <div className="p-6">
              {/* Contact Form */}
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
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
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                      }`}
                    placeholder="What's your email?"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                      }`}
                    placeholder="Tell me about the opportunity, project, or partnership you'd like to discuss..."
                  />
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-lg transition-all duration-300 font-semibold text-white shadow-lg flex items-center justify-center ${isLoading
                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Send Message
                    </>
                  )}
                </button>
              </form>

              {/* Direct Email */}
              {userData?.email && !isLoading && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
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
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  );
};

export default ExecutiveTemplate;