import React from 'react';
import { useThemeStore } from '../store/themeStore';
import PersonalInfoForm from './forms/PersonalInfoForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import SkillsForm from './forms/SkillsForm';

const EditPanel: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  
  return (
    <div className={`w-full h-full overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6 space-y-8">
        <PersonalInfoForm />
        <ExperienceForm />
        <EducationForm />
        <SkillsForm />
      </div>
    </div>
  );
};

export default EditPanel;