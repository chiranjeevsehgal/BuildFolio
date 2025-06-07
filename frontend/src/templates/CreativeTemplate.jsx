// templates/CreativeTemplate.jsx
import React from 'react';
import { ExternalLink, Github, Star } from 'lucide-react';

const CreativeTemplate = ({ userData }) => {
  const hasPersonalInfo = userData?.personalInfo;
  const hasProfessional = userData?.professional;
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      {/* Hero */}
      <header className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-300">
            {userData?.firstName}
          </h1>
          <h2 className="text-6xl md:text-8xl font-bold mb-8">
            {userData?.lastName}
          </h2>
          {hasProfessional && userData.professional.title && (
            <p className="text-2xl md:text-3xl font-light text-pink-200">
              {userData.professional.title}
            </p>
          )}
        </div>
      </header>

      <main className="bg-white">
        {/* Creative Skills Grid */}
        {hasSkills && (
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">My Superpowers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {userData.professional.skills.map((skill, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl text-white text-center transform hover:scale-105 transition-transform">
                    <h3 className="font-bold text-lg">{skill}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects Showcase */}
        {hasProjects && (
          <section className="py-20 px-6 bg-gray-100">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Featured Work</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userData.projects.map((project, index) => (
                  <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                    <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex space-x-3">
                        {project.url && (
                          <a href={project.url} className="text-purple-600 hover:text-purple-800">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} className="text-gray-600 hover:text-gray-800">
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CreativeTemplate;