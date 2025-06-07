// templates/ExecutiveTemplate.jsx
import React from 'react';
import { MapPin, Phone, Mail, Linkedin, Building, Calendar } from 'lucide-react';

const ExecutiveTemplate = ({ userData }) => {
  const hasPersonalInfo = userData?.personalInfo;
  const hasProfessional = userData?.professional;
  const hasExperience = userData?.experience?.length > 0;
  const hasEducation = userData?.education?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Executive Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center space-x-8">
            <div className="w-32 h-32 bg-gray-300 rounded-full flex-shrink-0"></div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {userData?.firstName} {userData?.lastName}
              </h1>
              {hasProfessional && userData.professional.title && (
                <p className="text-xl text-gray-600 mb-4">{userData.professional.title}</p>
              )}
              
              {hasPersonalInfo && (
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  {userData.personalInfo.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {userData.personalInfo.location}
                    </div>
                  )}
                  {userData.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {userData.email}
                    </div>
                  )}
                  {userData.personalInfo.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {userData.personalInfo.phone}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Executive Summary */}
        {hasProfessional && userData.professional.summary && (
          <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{userData.professional.summary}</p>
          </section>
        )}

        {/* Professional Experience */}
        {hasExperience && (
          <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Professional Experience</h2>
            <div className="space-y-8">
              {userData.experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-blue-600 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900">{exp.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="w-4 h-4 mr-2" />
                    <span className="font-medium">{exp.company}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 mt-3">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {hasEducation && (
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Education</h2>
            <div className="space-y-6">
              {userData.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.school} • {edu.startDate} - {edu.endDate}</p>
                  {edu.description && (
                    <p className="text-gray-700 mt-2">{edu.description}</p>
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

export default ExecutiveTemplate;