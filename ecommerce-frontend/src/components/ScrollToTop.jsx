import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Start every new page at the top, like a regular page load.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
