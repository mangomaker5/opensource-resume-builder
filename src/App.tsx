import React, { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import Navigation from './components/Navigation';
import EditPanel from './components/EditPanel';
import PreviewPanel from './components/PreviewPanel';
import ResizablePanels from './components/ResizablePanels';

function App() {
  const { isDarkMode } = useThemeStore();
  
  // Apply theme attribute to document element for scrollbar styling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);
  
  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Navigation />
      
      <ResizablePanels
        leftPanel={<EditPanel />}
        rightPanel={<PreviewPanel />}
      />
    </div>
  );
}

export default App;