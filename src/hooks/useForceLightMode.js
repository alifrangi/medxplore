import { useEffect } from 'react';

/**
 * Hook that forces light mode while the component is mounted.
 * Restores the previous theme setting when unmounted.
 * Used for public-facing pages that should always be in light mode.
 */
const useForceLightMode = () => {
  useEffect(() => {
    const root = document.documentElement;
    const wasInDarkMode = root.classList.contains('dark-mode');

    // Force light mode
    root.classList.remove('dark-mode');
    root.classList.add('light-mode');

    // Restore previous mode on unmount
    return () => {
      if (wasInDarkMode) {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
      }
    };
  }, []);
};

export default useForceLightMode;
