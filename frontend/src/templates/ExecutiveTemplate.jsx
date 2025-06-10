// templates/ExecutiveTemplate.jsx
import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Linkedin, Building, Calendar, GraduationCap, Award, Users, TrendingUp, Globe, Twitter, Github, ExternalLink, Star, Briefcase } from 'lucide-react';

const ExecutiveTemplate = ({ userData }) => {
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
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;
  const hasCertifications = userData?.certifications?.length > 0;
  
  useEffect(() => {
    console.log(userData);
    
  },[userData])
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

  // Calculate years of experience
  const calculateExperience = () => {
    if (!hasExperience) return 0;
    const totalMonths = userData.experience.reduce((total, exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.current ? new Date() : new Date(exp.endDate);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      return total + months;
    }, 0);
    return Math.floor(totalMonths / 12);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Executive Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-12">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {userData?.profilePhoto ? (
                <img 
                  src={userData.profilePhoto} 
                  alt="Professional Profile"
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-xl border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl border-4 border-gray-200">
                  <span className="text-white font-bold text-3xl lg:text-4xl">
                    {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Executive Info */}
            <div className="flex-1">
              {hasBasicInfo && (
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                  {userData?.firstName && userData?.lastName 
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData?.firstName || userData?.lastName || 'Executive Professional'
                  }
                </h1>
              )}
              
              {hasTitle && (
                <p className="text-xl lg:text-2xl text-blue-600 font-semibold mb-6">{userData.professional.title}</p>
              )}

              {hasSummary && (
                <p className="text-lg text-gray-700 leading-relaxed mb-6 max-w-4xl">
                  {userData.professional.summary}
                </p>
              )}
              
              {/* Contact Information */}
              {hasContactInfo && (
                <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
                  {userData?.personalInfo?.location && (
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="font-medium">{userData.personalInfo.location}</span>
                    </div>
                  )}
                  {userData?.email && (
                    <a 
                      href={`mailto:${userData.email}`}
                      className="flex items-center bg-gray-100 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                    >
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="font-medium">{userData.email}</span>
                    </a>
                  )}
                  {userData?.personalInfo?.phone && (
                    <a 
                      href={`tel:${userData.personalInfo.phone}`}
                      className="flex items-center bg-gray-100 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="font-medium">{userData.personalInfo.phone}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Social Links */}
              {hasSocialLinks && (
                <div className="flex space-x-4">
                  {userData?.personalInfo?.socialLinks?.linkedin && (
                    <a 
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors shadow-lg"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.github && (
                    <a 
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full transition-colors shadow-lg"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.twitter && (
                    <a 
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-full transition-colors shadow-lg"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {userData?.personalInfo?.socialLinks?.website && (
                    <a 
                      href={ensureHttpProtocol(userData.personalInfo.socialLinks.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors shadow-lg"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Executive Overview Stats */}
        {(hasExperience || hasEducation || hasProjects || hasSkills) && (
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
              Professional Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {hasExperience && (
                <div className="text-center bg-blue-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{calculateExperience()}+</div>
                  <div className="text-gray-600 font-medium">Years Experience</div>
                </div>
              )}
              {hasProjects && (
                <div className="text-center bg-green-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">{userData.projects.length}</div>
                  <div className="text-gray-600 font-medium">Key Projects</div>
                </div>
              )}
              {hasSkills && (
                <div className="text-center bg-purple-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{userData.professional.skills.length}</div>
                  <div className="text-gray-600 font-medium">Core Skills</div>
                </div>
              )}
              {hasEducation && (
                <div className="text-center bg-orange-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{userData.education.length}</div>
                  <div className="text-gray-600 font-medium">Education</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Core Competencies */}
        {hasSkills && (
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 mr-3 text-blue-600" />
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userData.professional.skills.map((skill, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                  <span className="font-semibold text-blue-800">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {hasExperience && (
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
              Professional Experience
            </h2>
            <div className="space-y-8">
              {userData.experience.map((exp, index) => (
                <div key={index} className="relative">
                  {/* Timeline connector */}
                  {index !== userData.experience.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-blue-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-6">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-lg p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{exp.title || 'Position'}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-gray-600">
                            <div className="flex items-center font-semibold">
                              <Building className="w-5 h-5 mr-2 text-blue-600" />
                              {exp.company || 'Company'}
                            </div>
                            {exp.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {exp.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold mt-4 lg:mt-0">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                        </div>
                      </div>
                      
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed mb-4">{exp.description}</p>
                      )}
                      
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Achievements</h4>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, idx) => (
                              <li key={idx} className="flex items-start">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-700">{achievement}</span>
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
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <Award className="w-6 h-6 mr-3 text-blue-600" />
              Key Projects & Initiatives
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {userData.projects.map((project, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{project.title || 'Untitled Project'}</h3>
                    {project.featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>
                  )}
                  
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    {project.url && (
                      <a 
                        href={ensureHttpProtocol(project.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Project
                      </a>
                    )}
                    {project.githubUrl && (
                      <a 
                        href={ensureHttpProtocol(project.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-gray-800 font-medium text-sm"
                      >
                        <Github className="w-4 h-4 mr-1" />
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
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Education */}
          {hasEducation && (
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <GraduationCap className="w-6 h-6 mr-3 text-blue-600" />
                Education
              </h2>
              <div className="space-y-6">
                {userData.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-6 pb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {edu.degree || 'Degree'}
                    </h3>
                    <div className="text-blue-600 font-semibold mb-2">
                      {edu.school || edu.institution || 'Institution'}
                    </div>
                    <div className="flex items-center text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}
                    </div>
                    {edu.location && (
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        {edu.location}
                      </div>
                    )}
                    {edu.gpa && (
                      <div className="text-gray-700 mb-2">
                        <span className="font-medium">GPA:</span> {edu.gpa}
                      </div>
                    )}
                    {edu.description && (
                      <p className="text-gray-700 leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {hasCertifications && (
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-blue-600" />
                Certifications
              </h2>
              <div className="space-y-4">
                {userData.certifications.map((cert, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{cert.name || 'Certification'}</h3>
                      {cert.badge && (
                        <img src={cert.badge} alt="Badge" className="w-12 h-12 rounded" />
                      )}
                    </div>
                    <p className="text-blue-600 font-semibold mb-2">{cert.issuer || 'Issuer'}</p>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {cert.issueDate && formatDate(cert.issueDate)}
                      {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                    </div>
                    {cert.credentialUrl && (
                      <a 
                        href={ensureHttpProtocol(cert.credentialUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Let's Connect</h3>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Open to executive opportunities and strategic partnerships. 
              Let's discuss how we can drive success together.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {userData?.email && (
              <a 
                href={`mailto:${userData.email}`}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Schedule a Meeting
              </a>
            )}
            
            <button 
              onClick={() => window.print()}
              className="border-2 border-gray-600 hover:bg-gray-800 px-8 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Download Executive Resume
            </button>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              © {new Date().getFullYear()} {hasBasicInfo 
                ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() 
                : 'Executive Professional'}. 
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExecutiveTemplate;