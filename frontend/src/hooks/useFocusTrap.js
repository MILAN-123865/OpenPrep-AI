import { useEffect, useRef } from 'react';

export default function useFocusTrap(isActive, onClose) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Select all standard focusable element types
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) firstElement.focus();

    const handleKeyDown = (e) => {
      // 1. Structural Keyboard Trapping Logic
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }

      // 2. Global Modal Escape Command
      if (e.key === 'Escape' && onClose) {
        onClose();
      }

      // 3. Platform Hotkeys Architecture
      if (e.altKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        const nextBtn = document.querySelector('[data-a11y-shortcut="next-question"]');
        if (nextBtn) nextBtn.click();
      }

      if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const flipBtn = document.querySelector('[data-a11y-shortcut="flip-flashcard"]');
        if (flipBtn) flipBtn.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose]);

  return containerRef;
}
