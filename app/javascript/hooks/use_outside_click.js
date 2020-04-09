import { useEffect } from 'react';

export default function useOutsideClick(selector, action) {
  useEffect(() => {
    function handleClickOutside(event) {
      if ($(event.target).closest(selector).length === 0) {
        action();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selector]);
}
