import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Github, Check } from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { profileApi } from '../api/index';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/index';

const LANGUAGES  = ['JavaScript','TypeScript','Python','Go','Rust','Java','C++','Ruby','PHP','Swift','Kotlin','C#'];
const FRAMEWORKS = ['React','Vue','Next.js','Angular','Django','FastAPI','Express','Spring','Laravel','Rails','Flutter','NestJS'];
const INTERESTS  = ['Web','CLI Tools','Mobile','ML / AI','DevOps','Security','Documentation','Testing','Design Systems','Databases'];
const DIFFICULTIES = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Good first issue, help wanted'  },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Mid-complexity issues'           },
  { value: 'advanced',     label: 'Advanced',      desc: 'Complex, expert-level work'      },
];

// Bug fix: Pill used border-white/[0.07] bg-white/[0.03] which are invisible in light mode
// Now uses CSS variable-based inline styles
function Pill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
      style={{
        background:  selected ? 'rgba(10,132,255,0.10)' : 'var(--c-fill-3)',
        border:      `1px solid ${selected ? 'rgba(10,132,255,0.45)' : 'var(--glass-border)'}`,
        color:       selected ? '#0a84ff' : 'var(--c-text-3)',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--c-sep)';
          e.currentTarget.style.color = 'var(--c-text-1)';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.color = 'var(--c-text-3)';
        }
      }}
    >
      {selected && <Check size={10} />}
      {label}
    </button>
  );
}

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const qc    = useQueryClient();

  const [prefs, setPrefs] = useState({
    languages:            user?.preferences?.languages            || [],
    frameworks:           user?.preferences?.frameworks           || [],
    difficultyPreference: user?.preferences?.difficultyPreference || 'beginner',
    interests:            user?.preferences?.interests            || [],
  });

  const mutation = useMutation({
    mutationFn: profileApi.updatePreferences,
    onSuccess:  res => {
      updateUser(res.data);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['issues', 'foryou'] });
      toast.success('Preferences saved');
    },
    onError: () => toast.error('Could not save preferences'),
  });

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account and contribution preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — account info */}
        <div className="space-y-4">
          <div className="glass p-5">
            <div className="flex items-center gap-3 mb-5">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-14 h-14 rounded-2xl" />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-apple-blue"
                  style={{ background: 'rgba(10,132,255,0.15)' }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold" style={{ color: 'var(--c-text-1)' }}>{user?.username}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>
                  {user?.email || 'No email'}
                </p>
              </div>
            </div>

            {user?.bio && (
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--c-text-2)' }}>{user.bio}</p>
            )}

            <a
              href={`https://github.com/${user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full justify-center text-xs"
            >
              <Github size={13} /> View GitHub Profile
            </a>
          </div>

          {/* Stack summary */}
          <div className="glass p-5">
            <p className="section-label mb-3">Your stack</p>
            {prefs.languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {prefs.languages.map(l => (
                  <span key={l} className="tag text-xs bg-apple-blue/10 text-apple-blue">{l}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--c-text-4)' }}>No languages set yet</p>
            )}
          </div>
        </div>

        {/* Right — preferences form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Languages */}
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Languages</p>
              {prefs.languages.length > 0 && (
                <span className="text-[10px] text-apple-blue">{prefs.languages.length} selected</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <Pill key={l} label={l} selected={prefs.languages.includes(l)}
                  onClick={() => set('languages', toggle(prefs.languages, l))} />
              ))}
            </div>
          </div>

          {/* Frameworks */}
          <div className="glass p-5">
            <p className="section-label mb-4">Frameworks</p>
            <div className="flex flex-wrap gap-2">
              {FRAMEWORKS.map(f => (
                <Pill key={f} label={f} selected={prefs.frameworks.includes(f)}
                  onClick={() => set('frameworks', toggle(prefs.frameworks, f))} />
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="glass p-5">
            <p className="section-label mb-4">Experience level</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(({ value, label, desc }) => {
                const isSelected = prefs.difficultyPreference === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('difficultyPreference', value)}
                    // Bug fix: border-white/[0.07] bg-white/[0.03] → CSS vars
                    className="p-3 rounded-xl text-left transition-all duration-150"
                    style={{
                      background:   isSelected ? 'rgba(10,132,255,0.08)' : 'var(--c-fill-3)',
                      border:       `1px solid ${isSelected ? 'rgba(10,132,255,0.40)' : 'var(--glass-border)'}`,
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'var(--c-sep)';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'var(--glass-border)';
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: isSelected ? '#0a84ff' : 'var(--c-text-2)' }}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] leading-snug" style={{ color: 'var(--c-text-4)' }}>
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests */}
          <div className="glass p-5">
            <p className="section-label mb-4">Interests</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <Pill key={i} label={i} selected={prefs.interests.includes(i)}
                  onClick={() => set('interests', toggle(prefs.interests, i))} />
              ))}
            </div>
          </div>

          <button
            onClick={() => mutation.mutate(prefs)}
            disabled={mutation.isPending}
            className="btn-primary w-full justify-center py-2.5"
          >
            {mutation.isPending ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
