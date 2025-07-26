// src/App.tsx
import React, { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import Navigation from './components/Navigation';
import EditPanel from './components/EditPanel';
import PreviewPanel from './components/PreviewPanel';
import ResizablePanels from './components/ResizablePanels';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { isDarkMode } = useThemeStore();
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  useEffect(() => {
    console.log('Resume Builder App initialized with persistence');
    console.log('Theme:', isDarkMode ? 'Dark' : 'Light');
  }, [isDarkMode]);
  
  return (
    <ErrorBoundary>
      <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Navigation />
        
        <ResizablePanels
          leftPanel={<EditPanel />}
          rightPanel={<PreviewPanel />}
        />
        
        <AutoSaveIndicator />
      </div>
    </ErrorBoundary>
  );
}

export default App;