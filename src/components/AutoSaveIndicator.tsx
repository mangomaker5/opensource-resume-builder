// src/components/AutoSaveIndicator.tsx
import React, { useState, useEffect } from 'react';
import { Check, Save } from 'lucide-react';
import { useResumeStore } from '../store/resumeStore';
import { useThemeStore } from '../store/themeStore';

const AutoSaveIndicator: React.FC = () => {
  const { lastSaved } = useResumeStore();
  const { isDarkMode } = useThemeStore();
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const formatLastSaved = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just saved';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Saved ${minutes}m ago`;
      } else {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Saved ${hours}h ago`;
      }
    } catch {
      return 'Auto-saved';
    }
  };

  if (!lastSaved) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300
      ${showSaved 
        ? `${isDarkMode ? 'bg-green-900/90 text-green-300 border border-green-600' : 'bg-green-100 text-green-800 border border-green-300'}` 
        : `${isDarkMode ? 'bg-gray-800/90 text-gray-400 border border-gray-700' : 'bg-gray-100 text-gray-600 border border-gray-300'}`
      }
    `}>
      {showSaved ? (
        <Check className="w-4 h-4" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {showSaved ? 'Saved!' : formatLastSaved(lastSaved)}
      </span>
    </div>
  );
};

export default AutoSaveIndicator;