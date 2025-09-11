import { useEffect } from 'react';

export const usePageUnload = (callback: () => void) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      callback();
    };

    const handlePopState = () => {
      callback();
    };

    // Handle browser navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Clean up on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      callback(); // Also call when component unmounts
    };
  }, [callback]);
};