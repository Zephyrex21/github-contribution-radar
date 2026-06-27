import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/index';
import { ForgeWordmark } from '../components/ui/Logo';

const LANGUAGES  = ['JavaScript','TypeScript','Python','Go','Rust','Java','C++','Ruby','PHP','Swift','Kotlin','C#'];
const FRAMEWORKS = ['React','Vue','Next.js','Angular','Django','FastAPI','Express','Spring','Flutter','NestJS'];
const INTERESTS  = ['Web','CLI Tools','Mobile','ML / AI','DevOps','Security','Documentation','Testing'];
const DIFFICULTIES = [
  { value: 'beginner',     emoji: '🌱', label: 'Beginner',     desc: "Just getting started with open source" },
  { value: 'intermediate', emoji: '🚀', label: 'Intermediate', desc: "Have made contributions before"          },
  { value: 'advanced',     emoji: '⚡', label: 'Advanced',      desc: "Looking for complex challenges"          },
];
const STEPS = ['Languages', 'Frameworks', 'Experience', 'Interests'];

function Pill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
      style={{
        background: selected ? 'rgba(10,132,255,0.10)' : 'var(--c-fill-3)',
        border: `1px solid ${selected ? 'rgba(10,132,255,0.45)' : 'var(--glass-border)'}`,
        color: selected ? 'var(--c-accent)' : 'var(--c-text-3)',
      }}
    >
      {selected && <Check size={10} />}
      {label}
    </button>
  );
}

function toggle(arr, v) { return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]; }

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    languages: [], frameworks: [], difficultyPreference: 'beginner', interests: [],
  });

  const mutation = useMutation({
    mutationFn: profileApi.updatePreferences,
    onSuccess: res => { updateUser(res.data); navigate('/discovery', { replace: true }); },
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canNext = step === 0 ? form.languages.length > 0 : true;

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else mutation.mutate(form);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 bg-mesh"
      style={{ backgroundColor: 'var(--c-bg)' }}
    >
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <ForgeWordmark size={32} />
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-300 flex-shrink-0"
                style={{
                  background: i <= step ? 'var(--c-accent)' : 'var(--c-fill-3)',
                  color: i <= step ? 'white' : 'var(--c-text-4)',
                  boxShadow: i === step ? '0 0 12px rgba(10,132,255,0.4)' : 'none',
                }}
              >
                {i < step ? <Check size={10} /> : i + 1}
              </div>
              <span
                className="text-xs hidden sm:inline"
                style={{ color: i === step ? 'var(--c-text-1)' : 'var(--c-text-4)', fontWeight: i === step ? 600 : 400 }}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px ml-1" style={{ background: 'var(--c-sep)' }}>
                  <div
                    className="h-px transition-all duration-500"
                    style={{
                      width: i < step ? '100%' : '0%',
                      background: 'var(--c-accent)',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass p-6 mb-5 animate-slide-up">
          {step === 0 && (
            <>
              <h2 className="text-lg font-bold gradient-text mb-1">What languages do you use?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--c-text-3)' }}>
                Select all that apply — we'll rank issues by language match.
              </p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <Pill key={l} label={l} selected={form.languages.includes(l)}
                    onClick={() => set('languages', toggle(form.languages, l))} />
                ))}
              </div>
              {form.languages.length === 0 && (
                <p className="text-apple-red text-xs mt-3 opacity-70">Select at least one</p>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-bold gradient-text mb-1">Frameworks you work with?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--c-text-3)' }}>
                Optional — helps us find more relevant issues.
              </p>
              <div className="flex flex-wrap gap-2">
                {FRAMEWORKS.map(f => (
                  <Pill key={f} label={f} selected={form.frameworks.includes(f)}
                    onClick={() => set('frameworks', toggle(form.frameworks, f))} />
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-bold gradient-text mb-1">Your experience level?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--c-text-3)' }}>
                Affects which issues we surface in your For You feed.
              </p>
              <div className="space-y-2">
                {DIFFICULTIES.map(({ value, emoji, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('difficultyPreference', value)}
                    className="w-full p-4 rounded-xl text-left transition-all duration-150 flex items-center gap-3"
                    style={{
                      background: form.difficultyPreference === value ? 'rgba(10,132,255,0.08)' : 'var(--c-fill-3)',
                      border: `1px solid ${form.difficultyPreference === value ? 'rgba(10,132,255,0.4)' : 'var(--glass-border)'}`,
                    }}
                  >
                    <span className="text-xl">{emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold"
                        style={{ color: form.difficultyPreference === value ? 'var(--c-accent)' : 'var(--c-text-2)' }}>
                        {label}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--c-text-4)' }}>{desc}</p>
                    </div>
                    {form.difficultyPreference === value && <Check size={14} className="text-apple-blue" />}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-bold gradient-text mb-1">Areas of interest?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--c-text-3)' }}>
                Optional — personalizes your dashboard and feed.
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(i => (
                  <Pill key={i} label={i} selected={form.interests.includes(i)}
                    onClick={() => set('interests', toggle(form.interests, i))} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1.5 text-sm">
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext || mutation.isPending}
            className="btn-primary flex-1 justify-center py-2.5"
          >
            {mutation.isPending ? 'Setting up...' : step === STEPS.length - 1 ? 'Start with Forge' : 'Continue'}
            {!mutation.isPending && <ChevronRight size={14} />}
          </button>
        </div>

        <button
          onClick={() => mutation.mutate(form)}
          className="w-full text-center text-xs mt-4 transition-colors"
          style={{ color: 'var(--c-text-4)' }}
        >
          Skip setup →
        </button>
      </div>
    </div>
  );
}
