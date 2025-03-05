
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DevModePanel from '@/components/dev-mode/DevModePanel';
import DevModeToggle from '@/components/dev-mode/DevModeToggle';

interface DevModeManagerProps {
  children: React.ReactNode;
}

const DevModeManager: React.FC<DevModeManagerProps> = ({ children }) => {
  const { toast } = useToast();
  const [isDeveloperMode, setIsDeveloperMode] = useState(() => {
    return localStorage.getItem('developerMode') === 'true';
  });
  const [showDevPanel, setShowDevPanel] = useState(false);

  const toggleDeveloperMode = () => {
    const newMode = !isDeveloperMode;
    setIsDeveloperMode(newMode);
    localStorage.setItem('developerMode', newMode.toString());
    
    toast({
      title: newMode ? "Developer Mode Enabled" : "Developer Mode Disabled",
      description: newMode ? "You can now access advanced testing features" : "Developer features are now hidden",
    });
    
    if (newMode) {
      setShowDevPanel(true);
    } else {
      setShowDevPanel(false);
    }
  };

  const openDevPanel = () => {
    setShowDevPanel(true);
  };

  const closeDevPanel = () => {
    setShowDevPanel(false);
  };

  return (
    <>
      {children}
      
      <DevModeToggle
        isDeveloperMode={isDeveloperMode}
        toggleDeveloperMode={toggleDeveloperMode}
        openDevPanel={openDevPanel}
      />
      
      {showDevPanel && isDeveloperMode && (
        <DevModePanel onClose={closeDevPanel} />
      )}
    </>
  );
};

export default DevModeManager;
