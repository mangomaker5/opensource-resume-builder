import React from 'react';
import { useThemeStore } from './store/themeStore';
import Navigation from './components/Navigation';
import EditPanel from './components/EditPanel';
import PreviewPanel from './components/PreviewPanel';
import ResizablePanels from './components/ResizablePanels';

function App() {
  const { isDarkMode } = useThemeStore();
  
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