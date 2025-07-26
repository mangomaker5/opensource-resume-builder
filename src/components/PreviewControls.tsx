// src/components/PreviewControls.tsx
import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useResumeStore } from '../store/resumeStore';
import { useThemeStore } from '../store/themeStore';
import ResumePDFDocument from './ResumePDFDocument';

const PreviewControls: React.FC = () => {
  const { zoom, setZoom, resetZoom, resumeData } = useResumeStore();
  const { isDarkMode } = useThemeStore();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.3));
  };

  const handleDownload = async () => {
    try {
      // Generate text-based PDF using @react-pdf/renderer
      const blob = await pdf(<ResumePDFDocument resumeData={resumeData} />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.fullName || 'resume'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className={`border-t p-3 flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className={`p-2 rounded-md transition-colors ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 px-3">
          <input
            type="range"
            min="0.3"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className={`text-sm min-w-[3rem] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
        
        <button
          onClick={handleZoomIn}
          className={`p-2 rounded-md transition-colors ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <button
          onClick={resetZoom}
          className={`p-2 rounded-md transition-colors ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title="Auto-fit"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
      
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download Resume
      </button>
    </div>
  );
};

export default PreviewControls;