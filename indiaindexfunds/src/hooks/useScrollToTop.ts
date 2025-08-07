import { useEffect, useCallback } from 'react';

export const useScrollToTop = () => {
  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior
    });
  }, []);

  // Scroll to top on page reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use instant scroll for page reload to avoid visual glitch
      window.scrollTo(0, 0);
    };

    const handleLoad = () => {
      // Ensure we're at the top when page loads
      window.scrollTo(0, 0);
    };

    // Listen for page reload events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return scrollToTop;
}; 