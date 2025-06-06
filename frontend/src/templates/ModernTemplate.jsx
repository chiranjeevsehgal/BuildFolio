import React, { useEffect } from 'react';
import { 
  MapPin, Phone, Mail, Github, Linkedin, Twitter, ExternalLink, 
  Download, Calendar, Building, GraduationCap, Award, Star, 
  Code, Briefcase, User, Globe, ChevronRight, ArrowUpRight,
  Clock, Users, Zap, Target, Eye, Heart
} from 'lucide-react';

const ModernTemplate = ({ userData }) => {
  // Comprehensive validation helpers
  const hasPersonalInfo = userData?.personalInfo;
  const hasBasicInfo = userData?.user?.firstName || userData?.user?.lastName || userData?.user?.email;
  const hasProfessional = userData?.professional;
  const hasTitle = userData?.title;
  const hasSummary = userData?.summary;
  const hasSkills = userData?.professional?.skills?.length > 0;
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasProjects = userData?.projects?.length > 0;
  const hasCertifications = userData?.certifications?.length > 0;
  const hasSocialLinks = userData?.socialLinks && 
    (userData?.socialLinks?.linkedin || 
     userData?.socialLinks?.github || 
     userData?.socialLinks?.twitter);
  const hasContactInfo = userData?.phone || 
                        userData?.location || 
                        userData?.user?.email;

  // Helper function to ensure URLs have proper protocol
  const ensureHttpProtocol = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  useEffect(() => {
    console.log(userData);
    
  },[hasBasicInfo])

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

  // Reusable Components
  const Section = ({ children, className = "" }) => (
    <section className={`mb-20 ${className}`}>{children}</section>
  );

  const SectionTitle = ({ icon: Icon, title, subtitle, gradient = "from-blue-500 to-purple-600" }) => (
    <div className="text-center mb-16">
      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg mb-6`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
      {subtitle && <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>}
    </div>
  );

  const SkillCard = ({ skill, level = 85, category = "Technical" }) => (
    <div className="group relative bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{skill}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{category}</span>
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
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-blue-300 p-8 transition-all duration-300 hover:-translate-y-2">
        <div className="absolute -left-6 top-8 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">{index + 1}</span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {experience.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
              <div className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                <span className="font-medium">{experience.company}</span>
              </div>
              {experience.location && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{experience.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-4 py-2 rounded-full text-sm text-gray-700 font-medium mt-4 lg:mt-0">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(experience.startDate)} - {experience.current ? 'Present' : formatDate(experience.endDate)}
          </div>
        </div>
        
        {experience.description && (
          <p className="text-gray-700 leading-relaxed mb-4">{experience.description}</p>
        )}
        
        {experience.achievements && experience.achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 mb-3">Key Achievements</h4>
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
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          {project.featured && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </span>
          )}
        </div>
        
        {project.description && (
          <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>
        )}
        
        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.skills.map((skill, index) => (
              <span 
                key={index}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex gap-3">
          {project.url && (
            <a 
              href={ensureHttpProtocol(project.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a 
              href={ensureHttpProtocol(project.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
            >
              <Github className="w-4 h-4 mr-2" />
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const EducationCard = ({ education }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 p-8 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{education.degree}</h3>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              <span className="font-medium">{education.school}</span>
            </div>
            {education.location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{education.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 text-green-800 text-sm px-3 py-1 rounded-full font-medium ml-4">
          {formatDate(education.startDate)} - {formatDate(education.endDate) || 'Present'}
        </div>
      </div>
      
      {education.description && (
        <p className="text-gray-600 leading-relaxed">{education.description}</p>
      )}
      
      {education.gpa && (
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium">GPA: </span>{education.gpa}
        </div>
      )}
    </div>
  );

  const CertificationCard = ({ certification }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-purple-300 p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{certification.name}</h3>
        {certification.badge && (
          <img src={certification.badge} alt="Badge" className="w-12 h-12 rounded-lg" />
        )}
      </div>
      
      <p className="text-gray-600 mb-3">{certification.issuer}</p>
      
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="w-4 h-4 mr-1" />
        {certification.issueDate && formatDate(certification.issueDate)}
        {certification.expiryDate && ` - ${formatDate(certification.expiryDate)}`}
      </div>
      
      {certification.credentialUrl && (
        <a 
          href={ensureHttpProtocol(certification.credentialUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          View Credential
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-700/20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
          {/* Profile Photo */}
          {userData?.profilePhoto && (
            <div className="mb-8">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
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
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800">
                {userData?.user?.firstName && userData?.user?.lastName 
                  ? `${userData?.user?.firstName} ${userData?.user?.lastName}`
                  : userData?.user?.firstName || userData?.user?.lastName || 'Professional Portfolio'
                }
              </h1>
              
              {hasTitle && (
                <p className="text-2xl md:text-3xl lg:text-4xl text-gray-700 font-light mb-6">
                  {userData.title}
                </p>
              )}
            </div>
          )}
          
          {/* Summary */}
          {hasSummary && (
            <div className="mb-12">
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {userData.summary}
              </p>
            </div>
          )}
          
          {/* Contact Info */}
          {hasContactInfo && (
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
              {userData?.user?.email && (
                <a 
                  href={`mailto:${userData.user.email}`}
                  className="group flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-300 rounded-2xl px-6 py-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Mail className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="text-gray-700 group-hover:text-blue-600 font-medium">{userData.user.email}</span>
                </a>
              )}
              
              {userData?.phone && (
                <a 
                  href={`tel:${userData.phone}`}
                  className="group flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-300 rounded-2xl px-6 py-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Phone className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="text-gray-700 group-hover:text-blue-600 font-medium">{userData.phone}</span>
                </a>
              )}
              
              {userData?.location && (
                <div className="flex items-center bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl px-6 py-4">
                  <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="text-gray-700 font-medium">{userData.location}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Social Links */}
          {hasSocialLinks && (
            <div className="flex justify-center space-x-4 mb-12">
              {userData?.socialLinks?.linkedin && (
                <a 
                  href={ensureHttpProtocol(userData.socialLinks.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-300 p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Linkedin className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
                </a>
              )}
              
              {userData?.socialLinks?.github && (
                <a 
                  href={ensureHttpProtocol(userData.socialLinks.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-gray-400 p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Github className="w-6 h-6 text-gray-700 group-hover:text-gray-900" />
                </a>
              )}
              
              {userData?.socialLinks?.twitter && (
                <a 
                  href={ensureHttpProtocol(userData.socialLinks.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 hover:border-blue-300 p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Twitter className="w-6 h-6 text-blue-500 group-hover:text-blue-600" />
                </a>
              )}
            </div>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.print()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Download Resume
            </button>
            
            {hasContactInfo && (
              <a 
                href={`mailto:${userData?.email || ''}`}
                className="border-2 border-white/80 text-gray-800 hover:bg-white/90 px-8 py-4 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center group backdrop-blur-sm"
              >
                <Mail className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Get In Touch
              </a>
            )}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-ping"></div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Skills Section */}
        {hasSkills && (
          <Section>
            <SectionTitle 
              icon={Code} 
              title="Skills & Expertise" 
              subtitle="Technologies and tools I work with to bring ideas to life"
              gradient="from-blue-500 to-cyan-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
              <div className="space-y-12 ml-16">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.certifications.map((cert, index) => (
                <CertificationCard key={index} certification={cert} />
              ))}
            </div>
          </Section>
        )}

        {/* Stats Section - if we have enough data */}
        {/* {(hasExperience || hasProjects || hasSkills) && (
          <Section>
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-3xl p-12 text-white">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">By the Numbers</h2>
                <p className="text-xl text-blue-100">Some highlights from my professional journey</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {hasExperience && (
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold mb-2">{userData.experience.length}</div>
                    <div className="text-blue-200">Companies</div>
                  </div>
                )}
                
                {hasProjects && (
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold mb-2">{userData.projects.length}</div>
                    <div className="text-blue-200">Projects</div>
                  </div>
                )}
                
                {hasSkills && (
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold mb-2">{userData.professional.skills.length}</div>
                    <div className="text-blue-200">Technologies</div>
                  </div>
                )}
                
                {hasExperience && (
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold mb-2">
                      {Math.max(...userData.experience.map(exp => 
                        new Date().getFullYear() - new Date(exp.startDate).getFullYear()
                      )) || 0}+
                    </div>
                    <div className="text-blue-200">Years Experience</div>
                  </div>
                )}
              </div>
            </div>
          </Section>
        )} */}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Let's Create Something Amazing Together</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              I'm always excited to take on new challenges and collaborate with innovative teams. 
              Let's discuss how we can bring your ideas to life.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {userData?.email && (
              <a 
                href={`mailto:${userData.email}`}
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group"
              >
                <Mail className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start a Conversation
              </a>
            )}
            
            <button 
              onClick={() => window.print()}
              className="border-2 border-gray-600 hover:bg-gray-800 px-8 py-4 rounded-2xl transition-all font-semibold flex items-center justify-center group"
            >
              <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Download Resume
            </button>
          </div>
          
          {/* Social Links Footer */}
          {hasSocialLinks && (
            <div className="flex justify-center space-x-6 mb-8">
              {userData?.socialLinks?.linkedin && (
                <a 
                  href={ensureHttpProtocol(userData.socialLinks.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-blue-600 p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                >
                  <Linkedin className="w-6 h-6 group-hover:text-white" />
                </a>
              )}
              
              {userData?.socialLinks?.github && (
                <a 
                  href={ensureHttpProtocol(userData.socialLinks.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                >
                  <Github className="w-6 h-6 group-hover:text-white" />
                </a>
              )}
              
              {userData?.socialLinks?.twitter && (
                <a 
                  href={ensureHttpProtocol(userData.socialLinks.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-blue-500 p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                >
                  <Twitter className="w-6 h-6 group-hover:text-white" />
                </a>
              )}
              
              {userData?.socialLinks?.website && (
                <a 
                  href={ensureHttpProtocol(userData.socialLinks.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 hover:bg-green-600 p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                >
                  <Globe className="w-6 h-6 group-hover:text-white" />
                </a>
              )}
            </div>
          )}
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              © {new Date().getFullYear()} {userData?.firstName && userData?.lastName 
                ? `${userData.firstName} ${userData.lastName}` 
                : 'Professional Portfolio'}. 
              Crafted with passion and attention to detail.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles for Animations */}
      <style >{`
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
    </div>
  );
};

export default ModernTemplate;