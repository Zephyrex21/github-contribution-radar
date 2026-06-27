import { useState, useRef } from 'react';
import { Check } from 'lucide-react';
export default function NotesEditor({ itemId, initialNote = '', onSave }) {
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);
  function handleBlur() {
    if (note !== initialNote) {
      onSave(itemId, note);
      setSaved(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setSaved(false), 2200);
    }
  }
  return (
    <div className="relative">
      <textarea
        value={note} onChange={e => setNote(e.target.value)} onBlur={handleBlur}
        maxLength={500} rows={2} placeholder="Add a note..."
        className="input-glass w-full text-xs resize-none py-2"
      />
      {saved && (
        <span className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-apple-green">
          <Check size={10} /> Saved
        </span>
      )}
    </div>
  );
}
