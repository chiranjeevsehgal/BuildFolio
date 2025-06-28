import React, { useState, useEffect } from 'react';
import { Github, ExternalLink, Terminal, Code, Mail, Phone, MapPin, Linkedin, Twitter, Globe, Calendar, Building, GraduationCap, Award, User, Zap, X, Send, Palette, Figma, Link, Briefcase } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const DeveloperTemplate = ({ userData }) => {
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
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasCertifications = userData?.certifications?.length > 0;

  // Terminal typing animation state
  const [currentCommand, setCurrentCommand] = useState('');
  const [showCursor, setShowCursor] = useState(true);

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

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Single Terminal Window */}
      <div className="bg-black border border-green-500 min-h-screen">
        {/* Terminal Header */}
        <div className="bg-black border-b border-green-500 p-4 sm:p-6 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="ml-2 sm:ml-4 text-gray-400 text-sm sm:text-base truncate">terminal — developer-portfolio</span>
              <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="text-gray-400 text-xs sm:text-sm">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Basic Info Commands */}
          <div className="space-y-2 text-sm sm:text-base">
            <p><span className="text-blue-400">$</span> whoami</p>
            {hasBasicInfo && (
              <p className="text-white break-words pl-2">
                {userData?.firstName && userData?.lastName
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData?.firstName || userData?.lastName || 'developer'
                }
              </p>
            )}

            <p><span className="text-blue-400">$</span> cat role.txt</p>
            {hasTitle && (
              <p className="text-white break-words pl-2">{userData.professional.title}</p>
            )}

            {hasSummary && (
              <>
                <p><span className="text-blue-400">$</span> cat about.md</p>
                <p className="text-gray-300 leading-relaxed break-words pl-2">{userData.professional.summary}</p>
              </>
            )}

            {/* Contact Info */}
            {hasContactInfo && (
              <>
                <p><span className="text-blue-400">$</span> cat contact.json</p>
                <div className="pl-2 text-yellow-300 text-xs sm:text-sm">
                  <p>&#123;</p>
                  {userData?.email && (
                    <p className="pl-2 break-all">
                      "email": "<a href={`mailto:${userData.email}`} className="text-blue-300 hover:text-blue-200 underline">{userData.email}</a>",
                    </p>
                  )}
                  {userData?.personalInfo?.phone && (
                    <p className="pl-2 break-all">
                      "phone": "<a href={`tel:${userData.personalInfo.phone}`} className="text-blue-300 hover:text-blue-200 underline">{userData.personalInfo.phone}</a>",
                    </p>
                  )}
                  {userData?.personalInfo?.location && (
                    <p className="pl-2 break-words">"location": "{userData.personalInfo.location}"</p>
                  )}
                  <p>&#125;</p>
                </div>
              </>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <>
                <p><span className="text-blue-400">$</span> ls social/</p>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 pl-2">
                  {userData?.personalInfo?.socialLinks?.github && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 flex items-center text-sm sm:text-base"
                      aria-label="GitHub Profile"
                    >
                      <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">github/</span>
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.linkedin && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center text-sm sm:text-base"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">linkedin/</span>
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.twitter && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center text-sm sm:text-base"
                      aria-label="Twitter Profile"
                    >
                      <Twitter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">twitter/</span>
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.website && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center text-sm sm:text-base"
                      aria-label="Personal Website"
                    >
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">website/</span>
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.portfolio && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 flex items-center text-sm sm:text-base"
                      aria-label="Portfolio"
                    >
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">portfolio/</span>
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.behance && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.behance)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 flex items-center text-sm sm:text-base"
                      aria-label="Behance Profile"
                    >
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">behance/</span>
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.dribbble && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.dribbble)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300 flex items-center text-sm sm:text-base"
                      aria-label="Dribbble Profile"
                    >
                      <Figma className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">dribbble/</span>
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.other && (
                    <a
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.other)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 flex items-center text-sm sm:text-base"
                      aria-label="Other Link"
                    >
                      <Link className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">other/</span>
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Skills */}
          {hasSkills && (
            <div className="space-y-2 text-sm sm:text-base">
              <p><span className="text-blue-400">$</span> cat skills.js</p>
              <div className="pl-2 space-y-1">
                <p className="text-purple-400">
                  <span className="text-blue-400">const</span> <span className="text-white">skills</span> = [
                </p>
                {userData.professional.skills.map((skill, index) => (
                  <p key={index} className="text-yellow-300 break-words pl-4">
                    '{skill}'{index < userData.professional.skills.length - 1 ? ',' : ''}
                  </p>
                ))}
                <p className="text-white">];</p>
                <p className="text-gray-400">
                  <span className="text-green-400">//</span> Total skills: {userData.professional.skills.length}
                </p>
              </div>
            </div>
          )}

          {/* Experience */}
          {hasExperience && (
            <div className="space-y-4">
              <p className="text-sm sm:text-base"><span className="text-blue-400">$</span> git log --oneline --work-experience</p>
              {userData.experience.map((exp, index) => (
                <div key={index} className="pl-2">
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-green-400 font-bold text-sm sm:text-base break-words">
                      <span className="text-yellow-400">commit:</span> {exp.title || 'Position'}
                    </p>
                    <p className="text-blue-400 text-sm break-words">
                      <span className="text-gray-400">Author:</span> {exp.company || 'Company'}
                      {exp.location && <span className="text-gray-400"> • {exp.location}</span>}
                    </p>
                    <p className="text-gray-400 text-xs break-words">
                      <span className="text-gray-500">Date:</span> {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </p>
                    {exp.description && (
                      <p className="text-gray-300 mt-2 leading-relaxed text-sm break-words">
                        <span className="text-green-400">//</span> {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-gray-400 text-xs mb-1">
                          <span className="text-blue-400">$</span> git show --achievements
                        </p>
                        <ul className="space-y-1 pl-2">
                          {exp.achievements.map((achievement, idx) => (
                            <li key={idx} className="text-green-300 text-xs sm:text-sm break-words">
                              <span className="text-green-500">+</span> {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {hasProjects && (
            <div className="space-y-4">
              <p className="text-sm sm:text-base"><span className="text-blue-400">$</span> ls -la repositories/</p>
              <p className="text-gray-400 text-sm pl-2">total {userData.projects.length} repositories</p>
              {userData.projects.map((project, index) => (
                <div key={index} className="pl-2 border-l-2 border-gray-700 ml-2">
                  <div className="flex items-center mb-2">
                    <Terminal className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                    <h3 className="text-blue-400 text-lg font-bold break-words">
                      {project.title || 'untitled-project'}
                    </h3>
                  </div>
                  {project.description && (
                    <p className="text-gray-300 mb-3 leading-relaxed text-sm break-words pl-6">
                      <span className="text-green-400">//</span> {project.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3 pl-6">
                    {project.githubUrl && (
                      <a
                        href={ensureHttpProtocol(project.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 transition-colors text-sm flex items-center"
                        title="View Source"
                        aria-label="View Source Code"
                      >
                        <Github className="w-4 h-4 mr-1" />
                        [source]
                      </a>
                    )}
                    {project.url && (
                      <a
                        href={ensureHttpProtocol(project.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center"
                        title="Live Demo"
                        aria-label="View Live Demo"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        [demo]
                      </a>
                    )}
                  </div>

                  {project.skills && project.skills.length > 0 && (
                    <div className="pl-6">
                      <p className="text-gray-400 text-xs mb-1">
                        <span className="text-blue-400">$</span> grep -o "dependencies" package.json
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="text-green-400 text-xs font-mono break-words"
                          >
                            #{skill}{skillIndex < project.skills.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {hasEducation && (
            <div className="space-y-2 text-sm sm:text-base">
              <p><span className="text-blue-400">$</span> cat education.json</p>
              <div className="pl-2">
                <p className="text-yellow-300">&#123;</p>
                <p className="text-blue-400 pl-2">"education": &#123;</p>
                {userData.education.map((edu, index) => (
                  <div key={index} className="pl-4 mb-3">
                    <p className="text-green-400 break-words">"{edu.degree || 'degree'}": &#123;</p>
                    <p className="text-gray-300 pl-2 text-xs break-words">"institution": "{edu.school || edu.institution || 'Institution'}",</p>
                    <p className="text-gray-300 pl-2 text-xs break-words">"duration": "{formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}",</p>
                    {edu.location && (
                      <p className="text-gray-300 pl-2 text-xs break-words">"location": "{edu.location}",</p>
                    )}
                    {edu.gpa && (
                      <p className="text-gray-300 pl-2 text-xs break-words">"grade": "{edu.gpa}",</p>
                    )}
                    {edu.description && (
                      <p className="text-gray-300 pl-2 text-xs break-words">"description": "{edu.description}"</p>
                    )}
                    <p className="text-green-400">&#125;{index < userData.education.length - 1 ? ',' : ''}</p>
                  </div>
                ))}
                <p className="text-blue-400 pl-2">&#125;</p>
                <p className="text-yellow-300">&#125;</p>
              </div>
            </div>
          )}

          {/* Certifications */}
          {hasCertifications && (
            <div className="space-y-2">
              <p className="text-sm sm:text-base"><span className="text-blue-400">$</span> env | grep CERT</p>
              <div className="pl-2 space-y-1">
                {userData.certifications.map((cert, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-green-400 font-mono text-xs sm:text-sm break-all flex-1">
                      CERT_{(cert.name || 'CERTIFICATION').toUpperCase().replace(/\s+/g, '_')}="{cert.issuer || 'Issuer'}"
                    </p>
                    {cert.credentialUrl && (
                      <a
                        href={ensureHttpProtocol(cert.credentialUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm flex-shrink-0"
                        aria-label="Verify Credential"
                      >
                        [verify]
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Commands */}
          <div className="space-y-2 pt-8 border-t border-gray-700">
            <p className="text-purple-400 text-sm">#!/bin/bash</p>
            <p className="text-gray-400 text-sm"># Thanks for checking out my portfolio!</p>
            <p className="text-gray-400 text-sm"># Feel free to reach out for collaboration</p>
            <div className="space-y-2 text-sm">
              {userData?.email && (
                <p>
                  <span className="text-blue-400">$</span> <span className="text-green-400">echo "Let's connect:</span>
                  <a href={`mailto:${userData.email}`} className="text-blue-400 hover:text-blue-300 underline break-all ml-1">
                    {userData.email}
                  </a>
                  <span className="text-green-400">"</span>
                </p>
              )}
              <p>
                <span className="text-blue-400">$</span> <span className="text-green-400">echo "Send message:</span>
                <button 
                  onClick={openModal} 
                  className="text-yellow-400 hover:text-yellow-300 underline cursor-pointer ml-1"
                >
                  ./contact.sh
                </button>
                <span className="text-green-400">"</span>
              </p>
              <p>
                <span className="text-blue-400">$</span> <span className="text-green-400">echo "Download resume:</span>
                <button 
                  onClick={() => window.print()} 
                  className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer ml-1"
                >
                  ./print.sh
                </button>
                <span className="text-green-400">"</span>
              </p>
            </div>
            <p className="text-gray-400 text-xs break-words pt-4">
              <span className="text-green-400">#</span> © {new Date().getFullYear()} {hasBasicInfo
                ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
                : 'Developer'
              } - Built with passion and caffeine ☕
            </p>
            
            <p className="flex items-center text-sm">
              <span className="text-blue-400">$</span>
              <span className="ml-1">{showCursor ? '|' : ' '}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Contact Modal - Terminal Style */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleModalClick}
        >
          <div className="bg-black border-2 border-green-500 rounded-lg max-w-md w-full mx-auto shadow-2xl font-mono relative overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-black border-b border-green-500 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm">terminal — contact.sh</span>
              </div>
              <button
                onClick={closeModal}
                disabled={isLoading}
                className={`text-red-400 hover:text-red-300 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                aria-label="Close terminal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="text-green-400 text-sm mb-2">Processing...</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 space-y-4">
              {/* Terminal Header */}
              <div className="text-green-400 text-sm mb-4">
                <p><span className="text-blue-400">$</span> ./contact.sh --initialize</p>
                <p className="text-gray-400"># Establishing secure connection...</p>
                <p className="text-yellow-400"># Ready to receive your message</p>
              </div>

              {/* Contact Form */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Name Field */}
                <div>
                  <p className="text-green-400 text-sm mb-2">
                    <span className="text-blue-400">$</span> echo "Enter your name:"
                  </p>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full bg-black border border-gray-600 focus:border-green-500 rounded px-3 py-2 text-green-400 font-mono text-sm transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    placeholder="> name_here"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <p className="text-green-400 text-sm mb-2">
                    <span className="text-blue-400">$</span> echo "Enter your email:"
                  </p>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className={`w-full bg-black border border-gray-600 focus:border-green-500 rounded px-3 py-2 text-green-400 font-mono text-sm transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    placeholder="> email@domain.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <p className="text-green-400 text-sm mb-2">
                    <span className="text-blue-400">$</span> cat &gt; message.txt
                  </p>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    rows={4}
                    className={`w-full bg-black border border-gray-600 focus:border-green-500 rounded px-3 py-2 text-green-400 font-mono text-sm resize-none transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    placeholder="> Your message here..."
                  />
                </div>

                {/* Send Button */}
                <div className="pt-2">
                  <p className="text-green-400 text-sm mb-3">
                    <span className="text-blue-400">$</span> ./send_message.sh
                  </p>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 border-2 rounded transition-all font-mono text-sm flex items-center justify-center ${isLoading
                      ? 'border-gray-600 bg-black text-gray-400 cursor-not-allowed'
                      : 'border-green-500 bg-black text-green-400 hover:bg-green-500/10 cursor-pointer'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="flex space-x-1 mr-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        EXECUTING...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        EXECUTE
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Direct Email */}
              {userData?.email && !isLoading && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-xs mb-2"># Alternative connection method:</p>
                  <p className="text-green-400 text-sm">
                    <span className="text-blue-400">$</span> mail -s "Direct Contact"
                    <a
                      href={`mailto:${userData.email}`}
                      className="text-yellow-400 hover:text-yellow-300 underline ml-1 break-all"
                    >
                      {userData.email}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        /* Extra small breakpoint for xs: utilities */
        @media (max-width: 480px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .transition-colors {
            transition: none;
          }
          .animate-pulse {
            animation: none;
          }
        }
        
        /* Terminal scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #000;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
        
        /* Better text overflow handling */
        .break-anywhere {
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        
        /* Focus styles for better accessibility */
        input:focus, textarea:focus, button:focus {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
        
        /* Smooth transitions */
        * {
          transition: border-color 0.2s ease-in-out;
        }
      `}</style>
      <Toaster
        position="top-center"
        reverseOrder={true}
        toastOptions={{
          style: {
            background: '#000',
            color: '#10b981',
            border: '1px solid #10b981',
            fontFamily: 'monospace',
            fontSize: '14px'
          }
        }}
      />
    </div>
  );
};

export default DeveloperTemplate;