import React, { createContext, useContext, useEffect } from 'react';
import { useTest } from './TestContext';
import toast from 'react-hot-toast';

interface SecurityContextType {
  isSecured: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTestActive, submitTest } = useTest();

  useEffect(() => {
    if (!isTestActive) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled during the test');
    };

    // Disable copy-paste shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        toast.error('Copy-paste is disabled during the test');
      }
      
      // Disable F12, Ctrl+Shift+I, etc.
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        toast.error('Developer tools are disabled during the test');
      }
    };

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && isTestActive) {
        toast.error('Test auto-submitted due to tab switch');
        submitTest();
      }
    };

    // Handle window blur (switching to another application)
    const handleWindowBlur = () => {
      if (isTestActive) {
        toast.error('Test auto-submitted due to window switch');
        submitTest();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isTestActive, submitTest]);

  return (
    <SecurityContext.Provider value={{ isSecured: isTestActive }}>
      {children}
    </SecurityContext.Provider>
  );
};