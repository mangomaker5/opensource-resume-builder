import React from 'react';
import { useResumeStore } from '../store/resumeStore';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

const ResumePreview: React.FC = () => {
  const { resumeData } = useResumeStore();
  const { personalInfo, experience, education, skills } = resumeData;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full h-full p-6 text-sm leading-tight font-sans overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-gray-600 text-xs">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.linkedIn && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" />
              <span className="truncate">{personalInfo.linkedIn}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span className="truncate">{personalInfo.website}</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 text-xs leading-relaxed">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs">
                      {exp.position || 'Position Title'}
                    </h3>
                    <p className="text-gray-700 text-xs">
                      {exp.company || 'Company Name'}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-gray-600 text-xs">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </div>
                </div>
                
                {exp.responsibilities.some(r => r.trim()) && (
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 ml-2">
                    {exp.responsibilities
                      .filter(r => r.trim())
                      .map((responsibility, index) => (
                        <li key={index} className="leading-relaxed">
                          {responsibility}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs">
                    {edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}
                  </h3>
                  <p className="text-gray-700 text-xs">
                    {edu.institution || 'Institution'}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                </div>
                <div className="text-gray-600 text-xs">
                  {formatDate(edu.graduationDate)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            TECHNICAL SKILLS
          </h2>
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.id}>
                {skill.category && (
                  <div className="flex">
                    <span className="font-semibold text-gray-900 text-xs mr-2">
                      {skill.category}:
                    </span>
                    <span className="text-gray-700 text-xs">
                      {skill.skills.filter(s => s.trim()).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;