
import React from 'react';
import { Phone, Mail, MapPin, Linkedin, Github, Calendar, Building, GraduationCap } from 'lucide-react';

const MinimalTemplate = ({ userData }) => {
  const hasPersonalInfo = userData?.personalInfo;
  const hasProfessional = userData?.professional;
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;
  const hasProjects = userData?.projects?.length > 0;
  const hasSkills = userData?.professional?.skills?.length > 0;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light mb-4">
            {userData?.firstName} {userData?.lastName}
          </h1>
          {hasProfessional && userData.professional.title && (
            <p className="text-xl text-gray-600 mb-8">{userData.professional.title}</p>
          )}
          
          {hasPersonalInfo && (
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              {userData.personalInfo.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {userData.personalInfo.phone}
                </div>
              )}
              {userData.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {userData.email}
                </div>
              )}
              {userData.personalInfo.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {userData.personalInfo.location}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Summary */}
        {hasProfessional && userData.professional.summary && (
          <section className="mb-16">
            <h2 className="text-2xl font-light mb-6 pb-2 border-b border-gray-200">About</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{userData.professional.summary}</p>
          </section>
        )}

        {/* Skills */}
        {hasSkills && (
          <section className="mb-16">
            <h2 className="text-2xl font-light mb-6 pb-2 border-b border-gray-200">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {userData.professional.skills.map((skill, index) => (
                <span key={index} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {hasExperience && (
          <section className="mb-16">
            <h2 className="text-2xl font-light mb-6 pb-2 border-b border-gray-200">Experience</h2>
            <div className="space-y-8">
              {userData.experience.map((exp, index) => (
                <div key={index}>
                  <h3 className="text-xl font-medium">{exp.title}</h3>
                  <p className="text-gray-600 mb-2">{exp.company} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                  {exp.description && <p className="text-gray-700">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default MinimalTemplate;