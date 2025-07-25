import React from 'react';
import { useResumeStore } from '../store/resumeStore';
import { useThemeStore } from '../store/themeStore';
import ResumePreview from './ResumePreview';
import PreviewControls from './PreviewControls';

const PreviewPanel: React.FC = () => {
  const { zoom } = useResumeStore();
  const { isDarkMode } = useThemeStore();

  return (
    <div className={`w-full h-full flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div 
          className="bg-white shadow-lg border border-gray-300 transition-transform duration-200 flex-shrink-0"
          style={{
            width: `${210 * zoom}mm`,
            height: `${297 * zoom}mm`,
            minWidth: `${210 * zoom}mm`,
            minHeight: `${297 * zoom}mm`,
            maxWidth: `${210 * zoom}mm`,
            maxHeight: `${297 * zoom}mm`
          }}
          id="resume-preview"
        >
          <ResumePreview />
        </div>
      </div>
      <PreviewControls />
    </div>
  );
};

export default PreviewPanel;