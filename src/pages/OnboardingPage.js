import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';

const GOALS = [
  {
    key: 'lose',
    label: 'Lose Weight',
    emoji: '🔥',
    desc: 'Calorie deficit to shed body fat',
    adjustment: '-500 kcal/day',
    color: 'border-orange-400 bg-orange-50 dark:bg-orange-500/10',
    activeRing: 'ring-2 ring-orange-400',
    badge: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20',
  },
  {
    key: 'maintain',
    label: 'Stay Lean',
    emoji: '⚖️',
    desc: 'Eat at maintenance to hold your current physique',
    adjustment: 'At TDEE',
    color: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
    activeRing: 'ring-2 ring-indigo-400',
    badge: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20',
  },
  {
    key: 'build',
    label: 'Build Muscle',
    emoji: '💪',
    desc: 'Calorie surplus to support muscle growth',
    adjustment: '+300 kcal/day',
    color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    activeRing: 'ring-2 ring-emerald-400',
    badge: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20',
  },
];

const ACTIVITIES = [
  { key: 'sedentary',   label: 'Sedentary',    desc: 'Desk job, little exercise',         mult: 1.2   },
  { key: 'light',       label: 'Lightly active', desc: '1–3 workouts/week',               mult: 1.375 },
  { key: 'moderate',    label: 'Moderately active', desc: '3–5 workouts/week',             mult: 1.55  },
  { key: 'active',      label: 'Very active',   desc: '6–7 intense workouts/week',         mult: 1.725 },
  { key: 'very_active', label: 'Athlete',       desc: '2x/day training or physical job',   mult: 1.9   },
];

function calcMacros({ goal, sex, age, heightCm, weightKg, activity }) {
  const mult = ACTIVITIES.find(a => a.key === activity)?.mult ?? 1.55;
  const bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  let calories = Math.round(bmr * mult);
  if (goal === 'lose')  calories -= 500;
  if (goal === 'build') calories += 300;

  const protein  = Math.round(weightKg * 2.0);
  const fats     = Math.round(weightKg * 0.8);
  const carbs    = Math.round((calories - protein * 4 - fats * 9) / 4);

  return { calories, protein, carbs: Math.max(carbs, 20), fats };
}

function StepDots({ step, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`rounded-full transition-all duration-300 ${
          i < step  ? 'w-5 h-2 bg-indigo-500' :
          i === step ? 'w-5 h-2 bg-indigo-400' :
                      'w-2 h-2 bg-gray-200 dark:bg-white/10'
        }`} />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const { updateUser } = useAuth();
  const [step, setStep]       = useState(0);
  const [saving, setSaving]   = useState(false);

  const [goal, setGoal]         = useState('');
  const [sex, setSex]           = useState('');
  const [age, setAge]           = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('0');
  const [weightLb, setWeightLb] = useState('');
  const [activity, setActivity] = useState('');

  const heightCm  = heightFt ? Math.round(parseInt(heightFt) * 30.48 + parseInt(heightIn || 0) * 2.54) : 0;
  const weightKg  = weightLb ? Math.round(parseFloat(weightLb) * 0.4536 * 10) / 10 : 0;

  const computed = (goal && sex && age && heightCm && weightKg && activity)
    ? calcMacros({ goal, sex, age: parseInt(age), heightCm, weightKg, activity })
    : null;

  const [macros, setMacros] = useState({ calories: '', protein: '', carbs: '', fats: '' });

  const goNext = () => {
    if (step === 2 && computed) {
      setMacros({ ...computed });
    }
    setStep(s => s + 1);
  };

  const step1Valid = !!goal;
  const step2Valid = sex && age && parseInt(age) > 0 && heightFt && parseInt(heightFt) > 0 && weightLb && parseFloat(weightLb) > 0 && activity;

  const handleFinish = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/api/user/profile', {
        goal, sex,
        age: parseInt(age),
        heightCm,
        weightKg,
        activity,
        macros: {
          protein:  parseInt(macros.protein),
          carbs:    parseInt(macros.carbs),
          fats:     parseInt(macros.fats),
          calories: parseInt(macros.calories),
        },
      });
      updateUser(res.data.user);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080810] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-base">🥗</div>
          <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">MacroBuddy</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          <StepDots step={step} total={3} />
          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 tabular-nums">
            {step + 1} / 3
          </span>
        </div>

        {/* ── Step 0: Goal ─────────────────────────────────────────── */}
        {step === 0 && (
          <div className="animate-page-in">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">What's your goal?</h1>
            <p className="text-sm text-gray-400 dark:text-slate-500 mb-8">We'll calculate your daily targets around it.</p>

            <div className="flex flex-col gap-3">
              {GOALS.map(g => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGoal(g.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                    goal === g.key
                      ? `${g.color} ${g.activeRing}`
                      : 'border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15 bg-white dark:bg-white/3'
                  }`}
                >
                  <span className="text-3xl shrink-0">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-black text-gray-900 dark:text-white">{g.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${g.badge}`}>{g.adjustment}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{g.desc}</p>
                  </div>
                  {goal === g.key && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                      <FaCheck size={9} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Stats ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-page-in">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Your stats</h1>
            <p className="text-sm text-gray-400 dark:text-slate-500 mb-8">Used to calculate your TDEE — never shared.</p>

            {/* Sex */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Biological sex</p>
              <div className="flex gap-3">
                {[{ key: 'male', label: 'Male' }, { key: 'female', label: 'Female' }].map(s => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSex(s.key)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
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

            {/* Age */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Age</p>
              <input
                type="number"
                inputMode="numeric"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="25"
                min="10"
                max="100"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            {/* Height */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Height</p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={heightFt}
                    onChange={e => setHeightFt(e.target.value)}
                    placeholder="5"
                    min="3"
                    max="8"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500">ft</span>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={heightIn}
                    onChange={e => setHeightIn(e.target.value)}
                    placeholder="10"
                    min="0"
                    max="11"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500">in</span>
                </div>
              </div>
            </div>

            {/* Weight */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Weight</p>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={weightLb}
                  onChange={e => setWeightLb(e.target.value)}
                  placeholder="160"
                  min="50"
                  max="500"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500">lbs</span>
              </div>
            </div>

            {/* Activity */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Activity level</p>
              <div className="flex flex-col gap-2">
                {ACTIVITIES.map(a => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setActivity(a.key)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      activity === a.key
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15'
                    }`}
                  >
                    <div>
                      <span className={`text-sm font-bold ${activity === a.key ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-slate-200'}`}>{a.label}</span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">{a.desc}</span>
                    </div>
                    {activity === a.key && <FaCheck size={11} className="text-indigo-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Macros review ────────────────────────────────── */}
        {step === 2 && (
          <div className="animate-page-in">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Your daily targets</h1>
            <p className="text-sm text-gray-400 dark:text-slate-500 mb-8">Calculated from your stats. Adjust anything that doesn't feel right.</p>

            {/* Calorie summary card */}
            {macros.calories && (
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-200 dark:border-indigo-500/20 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">Daily target</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 dark:text-white tabular-nums">{macros.calories}</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-slate-400">kcal / day</span>
                </div>
                <div className="mt-3 flex h-2 rounded-full overflow-hidden gap-px">
                  {macros.protein && macros.carbs && macros.fats && (() => {
                    const p = macros.protein * 4, c = macros.carbs * 4, f = macros.fats * 9;
                    const t = p + c + f || 1;
                    return (<>
                      <div className="bg-violet-500 rounded-l-full" style={{ width: `${(p/t)*100}%` }} />
                      <div className="bg-amber-400" style={{ width: `${(c/t)*100}%` }} />
                      <div className="bg-emerald-400 rounded-r-full" style={{ width: `${(f/t)*100}%` }} />
                    </>);
                  })()}
                </div>
                <div className="flex gap-4 mt-2">
                  {[
                    { label: 'Protein', color: 'bg-violet-500', val: macros.protein, unit: 'g' },
                    { label: 'Carbs',   color: 'bg-amber-400',  val: macros.carbs,   unit: 'g' },
                    { label: 'Fat',     color: 'bg-emerald-400',val: macros.fats,    unit: 'g' },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                      <span className={`w-2 h-2 rounded-full ${m.color}`} />
                      <span className="font-bold text-gray-800 dark:text-slate-200">{m.val}g</span> {m.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editable macro fields */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'calories', label: 'Calories', unit: 'kcal', color: '#6366f1' },
                { key: 'protein',  label: 'Protein',  unit: 'g',    color: '#8b5cf6' },
                { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#f59e0b' },
                { key: 'fats',     label: 'Fat',      unit: 'g',    color: '#10b981' },
              ].map(({ key, label, unit, color }) => (
                <div key={key}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color }}>{label}</p>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={macros[key]}
                      onChange={e => setMacros(prev => ({ ...prev, [key]: e.target.value }))}
                      min="0"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 transition"
                      style={{ '--tw-ring-color': color }}
                      onFocus={e => e.target.style.borderColor = color}
                      onBlur={e => e.target.style.borderColor = ''}
                    />
                    <span className="absolute right-3 text-xs font-bold text-gray-400 dark:text-slate-500">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-400 dark:text-slate-600">
              You can always update these later from your profile.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              <FaArrowLeft size={11} /> Back
            </button>
          ) : <div />}

          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={(step === 0 && !step1Valid) || (step === 1 && !step2Valid)}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
            >
              Continue <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving || !macros.calories || !macros.protein || !macros.carbs || !macros.fats}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <> Let's go! <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" /> </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
