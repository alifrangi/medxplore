import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal state
 *
 * @param {boolean} initialState - Initial open state (default: false)
 * @returns {object} Modal state and controls
 *
 * @example
 * const { isOpen, open, close, toggle } = useModal();
 *
 * // With data
 * const { isOpen, data, openWith, close } = useModal();
 * openWith({ id: 1, name: 'Item' });
 */
const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Open modal with associated data (e.g., item to edit)
  const openWith = useCallback((modalData) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    openWith,
    setData,
  };
};

export default useModal;
