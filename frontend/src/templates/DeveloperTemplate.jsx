import React, { useState, useEffect } from 'react';
import { Github, ExternalLink, Terminal, Code, Mail, Phone, MapPin, Linkedin, Twitter, Globe, Calendar, Building, GraduationCap, Award, User, Zap } from 'lucide-react';

const DeveloperTemplate = ({ userData }) => {
  // Fixed validation helpers based on actual data structure
  const hasBasicInfo = userData?.firstName || userData?.lastName;
  const hasTitle = userData?.professional?.title;
  const hasSummary = userData?.professional?.summary;
  const hasContactInfo = userData?.personalInfo?.phone || userData?.personalInfo?.location || userData?.email;
  const hasSocialLinks = userData?.personalInfo?.socialLinks && 
    (userData?.personalInfo?.socialLinks?.linkedin || 
     userData?.personalInfo?.socialLinks?.github || 
     userData?.personalInfo?.socialLinks?.twitter ||
     userData?.personalInfo?.socialLinks?.website);
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasCertifications = userData?.certifications?.length > 0;

  // Terminal typing animation state
  const [currentCommand, setCurrentCommand] = useState('');
  const [showCursor, setShowCursor] = useState(true);

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

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono">
      {/* Terminal Header */}
      <header className="bg-black p-6 border-b border-green-500">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="ml-4 text-gray-400">terminal — developer-portfolio</span>
            <div className="ml-auto flex items-center space-x-4">
              <Terminal className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-sm">v1.0.0</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p><span className="text-blue-400">$</span> whoami</p>
            {hasBasicInfo && (
              <p className="text-white">
                {userData?.firstName && userData?.lastName 
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData?.firstName || userData?.lastName || 'developer'
                }
              </p>
            )}
            
            <p><span className="text-blue-400">$</span> cat role.txt</p>
            {hasTitle && (
              <p className="text-white">{userData.professional.title}</p>
            )}

            {hasSummary && (
              <>
                <p><span className="text-blue-400">$</span> cat about.md</p>
                <p className="text-gray-300">{userData.professional.summary}</p>
              </>
            )}

            {/* Contact Info as Terminal Commands */}
            {hasContactInfo && (
              <>
                <p><span className="text-blue-400">$</span> cat contact.json</p>
                <div className="pl-4 text-yellow-300">
                  <p>&#123;</p>
                  {userData?.email && (
                    <p className="pl-4">
                      "email": "<a href={`mailto:${userData.email}`} className="text-blue-300 hover:text-blue-200 underline">{userData.email}</a>",
                    </p>
                  )}
                  {userData?.personalInfo?.phone && (
                    <p className="pl-4">
                      "phone": "<a href={`tel:${userData.personalInfo.phone}`} className="text-blue-300 hover:text-blue-200 underline">{userData.personalInfo.phone}</a>",
                    </p>
                  )}
                  {userData?.personalInfo?.location && (
                    <p className="pl-4">"location": "{userData.personalInfo.location}"</p>
                  )}
                  <p>&#125;</p>
                </div>
              </>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <>
                <p><span className="text-blue-400">$</span> ls social/</p>
                <div className="flex flex-wrap gap-4 pl-4">
                  {userData?.personalInfo?.socialLinks?.github && (
                    <a 
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 flex items-center"
                    >
                      <Github className="w-4 h-4 mr-1" />
                      github/
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.linkedin && (
                    <a 
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <Linkedin className="w-4 h-4 mr-1" />
                      linkedin/
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.twitter && (
                    <a 
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center"
                    >
                      <Twitter className="w-4 h-4 mr-1" />
                      twitter/
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.website && (
                    <a 
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      website/
                    </a>
                  )}
                </div>
              </>
            )}

            <p className="flex items-center">
              <span className="text-blue-400">$</span>
              <span className="ml-1">{showCursor ? '|' : ' '}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Skills as Code */}
        {hasSkills && (
          <section className="mb-12">
            <h2 className="text-2xl mb-6 text-white flex items-center">
              <Code className="w-6 h-6 mr-2" />
              <span className="text-blue-400">const</span> skills = [
            </h2>
            <div className="pl-6 space-y-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              {userData.professional.skills.map((skill, index) => (
                <p key={index} className="text-yellow-300">
                  &nbsp;&nbsp;'{skill}'{index < userData.professional.skills.length - 1 ? ',' : ''}
                </p>
              ))}
            </div>
            <p className="text-white mt-2">];</p>
          </section>
        )}

        {/* Experience as Git Log */}
        {hasExperience && (
          <section className="mb-12">
            <h2 className="text-2xl mb-6 text-white flex items-center">
              <Terminal className="w-6 h-6 mr-2" />
              git log --oneline --work-experience
            </h2>
            <div className="space-y-4">
              {userData.experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-6 bg-gray-800 rounded-r-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-green-400 font-bold">
                        <span className="text-yellow-400">commit:</span> {exp.title || 'Position'}
                      </p>
                      <p className="text-blue-400">
                        <span className="text-gray-400">Author:</span> {exp.company || 'Company'}
                        {exp.location && <span className="text-gray-400"> • {exp.location}</span>}
                      </p>
                      <p className="text-gray-400 text-sm">
                        <span className="text-gray-500">Date:</span> {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </p>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-300 mt-3 leading-relaxed">
                      <span className="text-gray-500">//</span> {exp.description}
                    </p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">Achievements:</p>
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-green-300 text-sm">
                            <span className="text-green-500">+</span> {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects as Repository List */}
        {hasProjects && (
          <section className="mb-12">
            <h2 className="text-2xl mb-6 text-white flex items-center">
              <Github className="w-6 h-6 mr-2" />
              Repositories ({userData.projects.length})
            </h2>
            <div className="space-y-4">
              {userData.projects.map((project, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-6 bg-gray-800 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-blue-400 text-lg font-bold mb-2 flex items-center">
                        <Terminal className="w-5 h-5 mr-2" />
                        {project.title || 'untitled-project'}
                      </h3>
                      {project.description && (
                        <p className="text-gray-300 mb-3 leading-relaxed">{project.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-3 ml-4">
                      {project.githubUrl && (
                        <a 
                          href={ensureHttpProtocol(project.githubUrl)} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 transition-colors p-2 border border-gray-600 rounded hover:border-green-500"
                          title="View Source"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.url && (
                        <a 
                          href={ensureHttpProtocol(project.url)} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors p-2 border border-gray-600 rounded hover:border-blue-500"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex} 
                          className="px-3 py-1 bg-gray-700 text-green-400 rounded-full text-sm border border-gray-600 font-mono"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education as Package.json Dependencies */}
        {hasEducation && (
          <section className="mb-12">
            <h2 className="text-2xl mb-6 text-white flex items-center">
              <GraduationCap className="w-6 h-6 mr-2" />
              cat education.json
            </h2>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-yellow-300">&#123;</p>
              <p className="text-blue-400 pl-4">"education": &#123;</p>
              {userData.education.map((edu, index) => (
                <div key={index} className="pl-8 mb-4">
                  <p className="text-green-400">"{edu.degree || 'degree'}": &#123;</p>
                  <p className="text-gray-300 pl-4">"institution": "{edu.school || edu.institution || 'Institution'}",</p>
                  <p className="text-gray-300 pl-4">"duration": "{formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}",</p>
                  {edu.location && (
                    <p className="text-gray-300 pl-4">"location": "{edu.location}",</p>
                  )}
                  {edu.gpa && (
                    <p className="text-gray-300 pl-4">"gpa": "{edu.gpa}",</p>
                  )}
                  {edu.description && (
                    <p className="text-gray-300 pl-4">"description": "{edu.description}"</p>
                  )}
                  <p className="text-green-400">&#125;{index < userData.education.length - 1 ? ',' : ''}</p>
                </div>
              ))}
              <p className="text-blue-400 pl-4">&#125;</p>
              <p className="text-yellow-300">&#125;</p>
            </div>
          </section>
        )}

        {/* Certifications as Environment Variables */}
        {hasCertifications && (
          <section className="mb-12">
            <h2 className="text-2xl mb-6 text-white flex items-center">
              <Award className="w-6 h-6 mr-2" />
              env | grep CERT
            </h2>
            <div className="space-y-2 bg-gray-800 rounded-lg p-4 border border-gray-700">
              {userData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between">
                  <p className="text-green-400 font-mono">
                    CERT_{(cert.name || 'CERTIFICATION').toUpperCase().replace(/\s+/g, '_')}="{cert.issuer || 'Issuer'}"
                  </p>
                  {cert.credentialUrl && (
                    <a 
                      href={ensureHttpProtocol(cert.credentialUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      [verify]
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer as Script */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-purple-400 mb-4">#!/bin/bash</p>
            <p className="text-gray-400"># Thanks for checking out my portfolio!</p>
            <p className="text-gray-400"># Feel free to reach out for collaboration</p>
            <br />
            <div className="space-y-2">
              {userData?.email && (
                <p className="text-green-400">
                  echo "Let's connect: <a href={`mailto:${userData.email}`} className="text-blue-400 hover:text-blue-300 underline">{userData.email}</a>"
                </p>
              )}
              <p className="text-green-400">
                echo "Download resume: <button onClick={() => window.print()} className="text-yellow-400 hover:text-yellow-300 underline cursor-pointer">portfolio.pdf</button>"
              </p>
              <p className="text-gray-400 mt-4">
                # © {new Date().getFullYear()} {hasBasicInfo 
                  ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() 
                  : 'Developer'
                } - Built with passion and caffeine
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Custom Styles */}
      <style>{`
        .bg-gray-750 {
          background-color: #374151;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .transition-colors {
            transition: none;
          }
        }
        
        /* Terminal scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
};

export default DeveloperTemplate;