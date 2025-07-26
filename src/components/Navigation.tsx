// src/components/Navigation.tsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, RotateCcw, FileText, Moon, Sun, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useResumeStore } from '../store/resumeStore';
import { useThemeStore } from '../store/themeStore';
import { parsePDFFile } from '../utils/pdfParser';
import ConfirmationModal from './ConfirmationModal';

const Navigation: React.FC = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    message: string;
    type: 'loading' | 'success' | 'error' | '';
  }>({ message: '', type: '' });
  
  const { resetResume, setResumeData } = useResumeStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setImportStatus({
          message: 'Invalid file. Please upload a PDF under 10MB.',
          type: 'error'
        });
        setTimeout(() => setImportStatus({ message: '', type: '' }), 4000);
        return;
      }
      
      if (acceptedFiles.length > 0) {
        await handlePDFImport(acceptedFiles[0]);
      }
    }
  });

  const handlePDFImport = async (file: File) => {
    console.log('Starting PDF import for:', file.name, 'Size:', file.size);
    
    setIsImporting(true);
    setImportStatus({ message: 'Reading PDF file...', type: 'loading' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setImportStatus({ message: 'Extracting text from PDF...', type: 'loading' });
      
      const parsedData = await parsePDFFile(file);
      
      if (parsedData) {
        setImportStatus({ message: 'Filling form fields...', type: 'loading' });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setResumeData(parsedData);
        
        setImportStatus({ 
          message: 'Resume imported successfully!', 
          type: 'success' 
        });
        
        console.log('PDF import completed successfully');
        
        setTimeout(() => {
          setImportStatus({ message: '', type: '' });
        }, 3000);
        
      } else {
        throw new Error('Failed to parse PDF content');
      }
      
    } catch (error: any) {
      console.error('PDF import failed:', error);
      
      setImportStatus({ 
        message: `Import failed: ${error.message || 'Unknown error'}`, 
        type: 'error' 
      });
      
      setTimeout(() => {
        setImportStatus({ message: '', type: '' });
      }, 5000);
      
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    resetResume();
    setShowResetModal(false);
  };

  const getStatusIcon = () => {
    switch (importStatus.type) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (importStatus.type) {
      case 'loading':
        return isDarkMode 
          ? 'bg-blue-900/20 text-blue-400 border-blue-400/30' 
          : 'bg-blue-100 text-blue-800 border-blue-300';
      case 'success':
        return isDarkMode 
          ? 'bg-green-900/20 text-green-400 border-green-400/30' 
          : 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return isDarkMode 
          ? 'bg-red-900/20 text-red-400 border-red-400/30' 
          : 'bg-red-100 text-red-800 border-red-300';
      default:
        return '';
    }
  };

  return (
    <>
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div
            {...getRootProps()}
            className={`
              flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
              ${isDragActive 
                ? `border-blue-400 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} scale-105` 
                : `${isDarkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`
              }
              ${isImporting ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input {...getInputProps()} disabled={isImporting} />
            {isImporting ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            ) : (
              <Upload className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isImporting 
                ? 'Processing...' 
                : isDragActive 
                ? 'Drop PDF here' 
                : 'Browse PDF / Drop file'
              }
            </span>
          </div>
          
          {importStatus.message && (
            <div className={`
              flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-all duration-200
              ${getStatusColor()}
            `}>
              {getStatusIcon()}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            opensourceresume
          </h1>
        </div>

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
            disabled={isImporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isImporting 
                ? 'opacity-50 cursor-not-allowed'
                : isDarkMode 
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