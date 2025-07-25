import React from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { useResumeStore } from '../../store/resumeStore';
import { useThemeStore } from '../../store/themeStore';

const ExperienceForm: React.FC = () => {
  const { resumeData, addExperience, updateExperience, deleteExperience } = useResumeStore();
  const { isDarkMode } = useThemeStore();
  const { experience } = resumeData;

  const addResponsibility = (expId: string) => {
    const exp = experience.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, {
        responsibilities: [...exp.responsibilities, '']
      });
    }
  };

  const updateResponsibility = (expId: string, index: number, value: string) => {
    const exp = experience.find(e => e.id === expId);
    if (exp) {
      const newResponsibilities = [...exp.responsibilities];
      newResponsibilities[index] = value;
      updateExperience(expId, { responsibilities: newResponsibilities });
    }
  };

  const removeResponsibility = (expId: string, index: number) => {
    const exp = experience.find(e => e.id === expId);
    if (exp && exp.responsibilities.length > 1) {
      const newResponsibilities = exp.responsibilities.filter((_, i) => i !== index);
      updateExperience(expId, { responsibilities: newResponsibilities });
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Work Experience</h2>
        </div>
        <button
          onClick={addExperience}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>
      
      <div className="p-4 space-y-6">
        {experience.length === 0 ? (
          <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No work experience added yet.</p>
        ) : (
          experience.map((exp, index) => (
            <div key={exp.id} className={`border rounded-lg p-4 relative ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => deleteExperience(exp.id)}
                className={`absolute top-3 right-3 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company *
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Company Name"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Position *
                  </label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Job Title"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="City, State"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date *
                  </label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date
                  </label>
                  <div className="space-y-2">
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                      disabled={exp.current}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                          : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                      }`}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, { 
                          current: e.target.checked,
                          endDate: e.target.checked ? '' : exp.endDate
                        })}
                        className={`rounded text-blue-600 focus:ring-blue-500 ${
                          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                        }`}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current position</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Key Responsibilities & Achievements
                </label>
                <div className="space-y-2">
                  {exp.responsibilities.map((responsibility, respIndex) => (
                    <div key={respIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={responsibility}
                        onChange={(e) => updateResponsibility(exp.id, respIndex, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Describe your responsibility or achievement..."
                      />
                      {exp.responsibilities.length > 1 && (
                        <button
                          onClick={() => removeResponsibility(exp.id, respIndex)}
                          className={`transition-colors ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addResponsibility(exp.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Responsibility
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExperienceForm;