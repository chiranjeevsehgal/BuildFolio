import React from 'react';
import { Phone, Mail, MapPin, Linkedin, Github, Calendar, Building, GraduationCap, ExternalLink } from 'lucide-react';

const MinimalTemplate = ({ userData }) => {
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
     userData?.personalInfo?.socialLinks?.website);

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
                    <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
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
            {userData?.email && (
              <a 
                href={`mailto:${userData.email}`}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
              >
                Get In Touch
              </a>
            )}
            <button 
              onClick={() => window.print()}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
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
    </div>
  );
};

export default MinimalTemplate;