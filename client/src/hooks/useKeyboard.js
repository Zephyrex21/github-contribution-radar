import { useEffect } from 'react';

export function useKeyboard(bindings) {
  useEffect(() => {
    function onKey(e) {
      for (const b of bindings) {
        const metaMatch  = b.meta  ? (e.metaKey || e.ctrlKey) : !e.metaKey && !e.ctrlKey;
        const shiftMatch = b.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch   = e.key.toLowerCase() === b.key.toLowerCase();
        if (keyMatch && metaMatch && shiftMatch) {
          e.preventDefault();
          b.handler(e);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bindings]);
}
