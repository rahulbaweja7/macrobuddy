import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaCheck, FaArrowRight } from 'react-icons/fa';

const GOALS = [
  { key: 'lose',     label: 'Lose Weight',   emoji: '🔥', adjustment: '-500 kcal/day',
    active: 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 ring-2 ring-orange-400',
    badge:  'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20' },
  { key: 'maintain', label: 'Stay Lean',     emoji: '⚖️', adjustment: 'At TDEE',
    active: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-400',
    badge:  'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20' },
  { key: 'build',    label: 'Build Muscle',  emoji: '💪', adjustment: '+300 kcal/day',
    active: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-400',
    badge:  'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20' },
];

const ACTIVITIES = [
  { key: 'sedentary',   label: 'Sedentary',        desc: 'Desk job, little exercise',       mult: 1.2   },
  { key: 'light',       label: 'Lightly active',   desc: '1–3 workouts/week',               mult: 1.375 },
  { key: 'moderate',    label: 'Moderately active', desc: '3–5 workouts/week',              mult: 1.55  },
  { key: 'active',      label: 'Very active',       desc: '6–7 intense workouts/week',      mult: 1.725 },
  { key: 'very_active', label: 'Athlete',           desc: '2x/day training or physical job', mult: 1.9  },
];

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#6366f1' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    color: '#8b5cf6' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#f59e0b' },
  { key: 'fats',     label: 'Fat',      unit: 'g',    color: '#10b981' },
];

function calcMacros({ goal, sex, age, heightCm, weightKg, activity }) {
  const mult = ACTIVITIES.find(a => a.key === activity)?.mult ?? 1.55;
  const bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  let calories = Math.round(bmr * mult);
  if (goal === 'lose')  calories -= 500;
  if (goal === 'build') calories += 300;
  const protein = Math.round(weightKg * 2.0);
  const fats    = Math.round(weightKg * 0.8);
  const carbs   = Math.max(Math.round((calories - protein * 4 - fats * 9) / 4), 20);
  return { calories, protein, carbs, fats };
}

function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  return { ft: Math.floor(totalIn / 12), inch: Math.round(totalIn % 12) };
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-200 dark:border-white/8 p-6 mb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-5">{title}</h2>
      {children}
    </div>
  );
}

export default function ProfilePage({ setPage, setAppMacros }) {
  const { user, updateUser } = useAuth();
  const p = user?.profile ?? {};

  const ftIn = p.heightCm ? cmToFtIn(p.heightCm) : { ft: '', inch: '0' };

  const [goal, setGoal]         = useState(p.goal || '');
  const [sex, setSex]           = useState(p.sex || '');
  const [age, setAge]           = useState(p.age ? String(p.age) : '');
  const [heightFt, setHeightFt] = useState(ftIn.ft !== '' ? String(ftIn.ft) : '');
  const [heightIn, setHeightIn] = useState(ftIn.inch !== '' ? String(ftIn.inch) : '0');
  const [weightLb, setWeightLb] = useState(p.weightKg ? String(Math.round(p.weightKg / 0.4536)) : '');
  const [activity, setActivity] = useState(p.activity || '');
  const [macros, setMacros]     = useState({
    calories: p.macros?.calories ?? '',
    protein:  p.macros?.protein  ?? '',
    carbs:    p.macros?.carbs    ?? '',
    fats:     p.macros?.fats     ?? '',
  });

  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  const heightCm = heightFt ? Math.round(parseInt(heightFt) * 30.48 + parseInt(heightIn || 0) * 2.54) : 0;
  const weightKg = weightLb ? Math.round(parseFloat(weightLb) * 0.4536 * 10) / 10 : 0;

  const canRecalc = goal && sex && age && heightCm && weightKg && activity;

  const recalc = () => {
    if (!canRecalc) return;
    const m = calcMacros({ goal, sex, age: parseInt(age), heightCm, weightKg, activity });
    setMacros({ calories: m.calories, protein: m.protein, carbs: m.carbs, fats: m.fats });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.patch('/api/user/profile', {
        goal, sex,
        age: parseInt(age) || null,
        heightCm: heightCm || null,
        weightKg: weightKg || null,
        activity,
        macros: {
          protein:  parseInt(macros.protein)  || null,
          carbs:    parseInt(macros.carbs)    || null,
          fats:     parseInt(macros.fats)     || null,
          calories: parseInt(macros.calories) || null,
        },
      });
      updateUser(res.data.user);
      setAppMacros({
        protein:  String(parseInt(macros.protein)  || ''),
        carbs:    String(parseInt(macros.carbs)    || ''),
        fats:     String(parseInt(macros.fats)     || ''),
        calories: String(parseInt(macros.calories) || ''),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#080810] min-h-screen">
      <div className="max-w-xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Profile</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Update your goal, stats, or macro targets anytime.</p>
        </div>

        {/* Goal */}
        <Section title="Goal">
          <div className="flex flex-col gap-2">
            {GOALS.map(g => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGoal(g.key)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  goal === g.key
                    ? g.active
                    : 'border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15'
                }`}
              >
                <span className="text-2xl shrink-0">{g.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-gray-900 dark:text-white">{g.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${g.badge}`}>{g.adjustment}</span>
                  </div>
                </div>
                {goal === g.key && (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                    <FaCheck size={9} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Stats */}
        <Section title="Stats">
          {/* Sex */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Biological sex</p>
            <div className="flex gap-3">
              {[{ key: 'male', label: 'Male' }, { key: 'female', label: 'Female' }].map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSex(s.key)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                    sex === s.key
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-white/8 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-white/15'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age + Weight row */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Age</p>
              <input
                type="number" inputMode="numeric" value={age} min="10" max="100"
                onChange={e => setAge(e.target.value)}
                placeholder="25"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Weight</p>
              <div className="relative">
                <input
                  type="number" inputMode="decimal" value={weightLb} min="50" max="500"
                  onChange={e => setWeightLb(e.target.value)}
                  placeholder="160"
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500">lbs</span>
              </div>
            </div>
          </div>

          {/* Height */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Height</p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="number" inputMode="numeric" value={heightFt} min="3" max="8"
                  onChange={e => setHeightFt(e.target.value)}
                  placeholder="5"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500">ft</span>
              </div>
              <div className="flex-1 relative">
                <input
                  type="number" inputMode="numeric" value={heightIn} min="0" max="11"
                  onChange={e => setHeightIn(e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500">in</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Activity level</p>
            <div className="flex flex-col gap-1.5">
              {ACTIVITIES.map(a => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setActivity(a.key)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-left transition-all ${
                    activity === a.key
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15'
                  }`}
                >
                  <div>
                    <span className={`text-sm font-bold ${activity === a.key ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-slate-200'}`}>{a.label}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">{a.desc}</span>
                  </div>
                  {activity === a.key && <FaCheck size={10} className="text-indigo-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Macro targets */}
        <Section title="Daily macro targets">
          {canRecalc && (
            <button
              type="button"
              onClick={recalc}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 transition"
            >
              <FaArrowRight size={9} /> Recalculate from stats
            </button>
          )}
          <div className="grid grid-cols-2 gap-4">
            {MACRO_FIELDS.map(({ key, label, unit, color }) => (
              <div key={key}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color }}>{label}</p>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={macros[key]}
                    onChange={e => setMacros(prev => ({ ...prev, [key]: e.target.value }))}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2.5 pr-14 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 transition"
                    onFocus={e => { e.target.style.borderColor = color; e.target.style.setProperty('--tw-ring-color', color); }}
                    onBlur={e => e.target.style.borderColor = ''}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Save */}
        {error && (
          <p className="mb-3 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/20"
        >
          {saving ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : saved ? (
            <><FaCheck size={12} /> Saved!</>
          ) : (
            'Save changes'
          )}
        </button>

      </div>
    </div>
  );
}
