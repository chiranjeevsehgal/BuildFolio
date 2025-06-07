import React from 'react';
import { Github, ExternalLink, Terminal, Code } from 'lucide-react';

const DeveloperTemplate = ({ userData }) => {
  const hasPersonalInfo = userData?.personalInfo;
  const hasProfessional = userData?.professional;
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;

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
          </div>
          
          <div className="space-y-2">
            <p><span className="text-blue-400">$</span> whoami</p>
            <p className="text-white">{userData?.firstName} {userData?.lastName}</p>
            <p><span className="text-blue-400">$</span> cat role.txt</p>
            {hasProfessional && userData.professional.title && (
              <p className="text-white">{userData.professional.title}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Skills as Code */}
        {hasSkills && (
          <section className="mb-12">
            <h2 className="text-2xl mb-6 text-white">
              <span className="text-blue-400">const</span> skills = [
            </h2>
            <div className="pl-6 space-y-1">
              {userData.professional.skills.map((skill, index) => (
                <p key={index} className="text-yellow-300">
                  '{skill}'{index < userData.professional.skills.length - 1 ? ',' : ''}
                </p>
              ))}
            </div>
            <p className="text-white">];</p>
          </section>
        )}

        {/* Projects as Repository List */}
        {hasProjects && (
          <section className="mb-12">
            <h2 className="text-2xl mb-6 text-white flex items-center">
              <Github className="w-6 h-6 mr-2" />
              Repositories
            </h2>
            <div className="space-y-4">
              {userData.projects.map((project, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-blue-400 text-lg font-bold">{project.title}</h3>
                    <div className="flex space-x-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} className="text-green-400 hover:text-green-300">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.url && (
                        <a href={project.url} className="text-green-400 hover:text-green-300">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3">{project.description}</p>
                  {project.skills && (
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-2 py-1 bg-gray-800 text-green-400 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default DeveloperTemplate;