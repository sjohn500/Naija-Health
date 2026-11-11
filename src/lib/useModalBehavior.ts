import { useEffect, useRef } from 'react';

const escapeStack: Array<() => void> = [];
let listenerAttached = false;

function handleGlobalKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && escapeStack.length > 0) {
    const topClose = escapeStack[escapeStack.length - 1];
    topClose();
  }
}

/**
 * Locks background scrolling while at least one modal is open and closes
 * only the topmost modal when Escape is pressed.
 */
export function useModalBehavior(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    if (typeof document !== 'undefined' && !listenerAttached) {
      document.addEventListener('keydown', handleGlobalKeyDown);
      listenerAttached = true;
    }

    const closeHandler = () => onCloseRef.current();
    escapeStack.push(closeHandler);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      const idx = escapeStack.lastIndexOf(closeHandler);
      if (idx !== -1) escapeStack.splice(idx, 1);

      if (escapeStack.length === 0) {
        document.body.style.overflow = prevOverflow || '';
      }
    };
  }, [isOpen]);
}
