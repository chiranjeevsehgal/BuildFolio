import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Linkedin, Github, Calendar, Building, GraduationCap, ExternalLink, X, Send, Palette, Figma, Link, Briefcase, Globe, Twitter } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MinimalTemplate = ({ userData }) => {
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
  const hasContactInfo = userData?.personalInfo?.phone || userData?.personalInfo?.location || userData?.email;
  const hasProfessional = userData?.professional;
  const hasTitle = userData?.professional?.title;
  const hasSummary = userData?.professional?.summary;
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;
  const hasSocialLinks = userData?.personalInfo?.socialLinks &&
    (userData?.personalInfo?.socialLinks?.linkedin ||
      userData?.personalInfo?.socialLinks?.github ||
      userData?.personalInfo?.socialLinks?.twitter ||
      userData?.personalInfo?.socialLinks?.website ||
      userData?.personalInfo?.socialLinks?.portfolio ||
      userData?.personalInfo?.socialLinks?.behance ||
      userData?.personalInfo?.socialLinks?.dribbble ||
      userData?.personalInfo?.socialLinks?.other);

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
        toast.success('Thank you! Your message has been sent successfully.')
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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {hasBasicInfo && (
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-3 sm:mb-4 break-words">
              {userData?.firstName && userData?.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : userData?.firstName || userData?.lastName || 'Professional Portfolio'
              }
            </h1>
          )}

          {hasTitle && (
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 break-words">{userData.professional.title}</p>
          )}

          {hasContactInfo && (
            <div className="flex flex-col sm:flex-row justify-center flex-wrap gap-4 sm:gap-6 text-sm text-gray-600 mb-6">
              {userData?.personalInfo?.phone && (
                <div className="flex items-center justify-center sm:justify-start">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <a href={`tel:${userData.personalInfo.phone}`} className="hover:text-gray-900 transition-colors break-all">
                    {userData.personalInfo.phone}
                  </a>
                </div>
              )}
              {userData?.email && (
                <div className="flex items-center justify-center sm:justify-start">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <a href={`mailto:${userData.email}`} className="hover:text-gray-900 transition-colors break-all">
                    {userData.email}
                  </a>
                </div>
              )}
              {userData?.personalInfo?.location && (
                <div className="flex items-center justify-center sm:justify-start">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="break-words">{userData.personalInfo.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {hasSocialLinks && (
            <div className="flex justify-center space-x-4 sm:space-x-6">
              {userData?.personalInfo?.socialLinks?.linkedin && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.github && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.twitter && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500 transition-colors"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.website && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                  aria-label="Personal Website"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.portfolio && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.portfolio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                  aria-label="Portfolio"
                >
                  <Briefcase className="w-5 h-5" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.behance && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.behance)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                  aria-label="Behance Profile"
                >
                  <Palette className="w-5 h-5" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.dribbble && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.dribbble)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                  aria-label="Dribbble Profile"
                >
                  <Figma className="w-5 h-5" />
                </a>
              )}
              {userData?.personalInfo?.socialLinks?.other && (
                <a
                  href={ensureHttpProtocol(userData.personalInfo.socialLinks.other)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                  aria-label="Other Link"
                >
                  <Link className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Summary */}
        {hasSummary && (
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6 pb-2 border-b border-gray-200">About</h2>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{userData.professional.summary}</p>
          </section>
        )}

        {/* Skills */}
        {hasSkills && (
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6 pb-2 border-b border-gray-200">Skills</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {userData.professional.skills.map((skill, index) => (
                <span key={index} className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium break-words">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {hasExperience && (
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6 pb-2 border-b border-gray-200">Experience</h2>
            <div className="space-y-6 sm:space-y-8">
              {userData.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4 sm:pl-6">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 break-words">{exp.title || 'Position'}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 mb-2 gap-1 sm:gap-0">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium break-words">{exp.company || 'Company'}</span>
                    </div>
                    {exp.location && (
                      <div className="flex items-center sm:ml-2">
                        <span className="hidden sm:inline mx-2">•</span>
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="break-words">{exp.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="break-words">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="space-y-1">
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex items-start">
                          <span className="text-gray-400 mr-2 mt-1 flex-shrink-0">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {hasProjects && (
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6 pb-2 border-b border-gray-200">Projects</h2>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
              {userData.projects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">
                    {project.title || 'Untitled Project'}
                  </h3>
                  {project.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">{project.description}</p>
                  )}
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded break-words">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    {project.url && (
                      <a
                        href={ensureHttpProtocol(project.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center sm:justify-start"
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
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center sm:justify-start"
                      >
                        <Github className="w-4 h-4 mr-1 flex-shrink-0" />
                        Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {hasEducation && (
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6 pb-2 border-b border-gray-200">Education</h2>
            <div className="space-y-4 sm:space-y-6">
              {userData.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4 sm:pl-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                    {edu.degree || 'Degree'}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 mb-2 gap-1 sm:gap-0">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium break-words">{edu.school || edu.institution || 'Institution'}</span>
                    </div>
                    {edu.location && (
                      <div className="flex items-center sm:ml-2">
                        <span className="hidden sm:inline mx-2">•</span>
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="break-words">{edu.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="break-words">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{edu.description}</p>
                  )}
                  {edu.gpa && (
                    <p className="text-gray-600 text-sm">Grade: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-4">
            <button
              onClick={openModal}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base cursor-pointer"
            >
              Get In Touch
            </button>
            <button
              onClick={() => window.print()}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base cursor-pointer"
            >
              Download Resume
            </button>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 break-words">
            © {new Date().getFullYear()} {hasBasicInfo
              ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
              : 'Professional Portfolio'
            }
          </p>
        </div>
      </footer>

      {/* Contact Modal - Minimal Style */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleModalClick}
        >
          <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full mx-auto shadow-xl relative">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-light text-gray-900">Get In Touch</h3>
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className={`text-gray-400 hover:text-gray-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">I'd love to hear from you.</p>
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600 text-sm">Sending message...</p>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Contact Form */}
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                      }`}
                    placeholder="What's your name?"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                      }`}
                    placeholder="What's your email?"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                      }`}
                    placeholder="What's your message?"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>

              {/* Direct Email */}
              {userData?.email && !isLoading && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500 mb-2">Or email directly:</p>
                  <a
                    href={`mailto:${userData.email}`}
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors break-all"
                  >
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

export default MinimalTemplate;