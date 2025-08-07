import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    // Scroll to top when pathname changes
    scrollToTop('smooth');
  }, [pathname, scrollToTop]);

  return null; // This component doesn't render anything
};

export default ScrollToTop; 