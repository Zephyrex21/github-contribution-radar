import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommandPalette from '../global/CommandPalette';
import { useKeyboard } from '../../hooks/useKeyboard';

export default function Layout() {
  const [cmdOpen, setCmdOpen] = useState(false);

  useKeyboard([
    { key: 'k', meta: true, handler: () => setCmdOpen(v => !v) },
  ]);

  return (
    <div
      className="min-h-screen bg-mesh"
      style={{ backgroundColor: 'var(--c-bg)', transition: 'background-color 0.25s ease' }}
    >
      <Sidebar onCommandPalette={() => setCmdOpen(true)} />

      <main
        className="min-h-screen"
        style={{ marginLeft: 'var(--sidebar-width)', padding: '32px 40px' }}
      >
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  );
}
