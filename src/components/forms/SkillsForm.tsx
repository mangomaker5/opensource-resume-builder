import React from 'react';
import { Code, Plus, Trash2 } from 'lucide-react';
import { useResumeStore } from '../../store/resumeStore';
import { useThemeStore } from '../../store/themeStore';

const SkillsForm: React.FC = () => {
  const { resumeData, addSkill, updateSkill, deleteSkill } = useResumeStore();
  const { isDarkMode } = useThemeStore();
  const { skills } = resumeData;

  const addSkillToCategory = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      updateSkill(skillId, {
        skills: [...skill.skills, '']
      });
    }
  };

  const updateSkillItem = (skillId: string, index: number, value: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      const newSkills = [...skill.skills];
      newSkills[index] = value;
      updateSkill(skillId, { skills: newSkills });
    }
  };

  const removeSkillItem = (skillId: string, index: number) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill && skill.skills.length > 1) {
      const newSkills = skill.skills.filter((_, i) => i !== index);
      updateSkill(skillId, { skills: newSkills });
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skills</h2>
        </div>
        <button
          onClick={addSkill}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Skill Category
        </button>
      </div>
      
      <div className="p-4 space-y-6">
        {skills.length === 0 ? (
          <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No skills added yet.</p>
        ) : (
          skills.map((skill) => (
            <div key={skill.id} className={`border rounded-lg p-4 relative ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => deleteSkill(skill.id)}
                className={`absolute top-3 right-3 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category *
                </label>
                <input
                  type="text"
                  value={skill.category}
                  onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., Programming Languages, Software, Technical Skills"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Skills
                </label>
                <div className="space-y-2">
                  {skill.skills.map((skillItem, skillIndex) => (
                    <div key={skillIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skillItem}
                        onChange={(e) => updateSkillItem(skill.id, skillIndex, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Enter a skill..."
                      />
                      {skill.skills.length > 1 && (
                        <button
                          onClick={() => removeSkillItem(skill.id, skillIndex)}
                          className={`transition-colors ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addSkillToCategory(skill.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Skill
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

export default SkillsForm;