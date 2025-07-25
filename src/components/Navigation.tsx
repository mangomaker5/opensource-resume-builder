import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, RotateCcw, FileText, Moon, Sun } from 'lucide-react';
import { useResumeStore } from '../store/resumeStore';
import { useThemeStore } from '../store/themeStore';
import ConfirmationModal from './ConfirmationModal';

const Navigation: React.FC = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const { resetResume } = useResumeStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      // TODO: Implement PDF parsing functionality
      console.log('PDF files:', acceptedFiles);
    }
  });

  const handleReset = () => {
    resetResume();
    setShowResetModal(false);
  };

  return (
    <>
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
        {/* Left - File Upload */}
        <div
          {...getRootProps()}
          className={`
            flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive 
              ? `border-blue-400 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}` 
              : `${isDarkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isDragActive ? 'Drop PDF here' : 'Browse PDF / Drop file'}
          </span>
        </div>

        {/* Center - Branding */}
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>opensourceresume</h1>
        </div>

        {/* Right - Theme Toggle and Reset Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          
          <button
            onClick={() => setShowResetModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Reset</span>
          </button>
        </div>
      </nav>

      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Reset Resume"
        message="Are you sure you want to reset your resume? All current data will be lost."
      />
    </>
  );
};

export default Navigation;