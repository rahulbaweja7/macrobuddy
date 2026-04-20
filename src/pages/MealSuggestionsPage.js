import { useState, useEffect } from 'react';
import { FaArrowRight, FaRedo, FaBolt, FaChevronRight } from 'react-icons/fa';
import MealCard from '../components/MealCard';

const AI_HINTS = [
  'Analyzing your macro targets…',
  'Crafting personalized recipes…',
  'Calculating nutrition profiles…',
  'Finding the perfect match…',
  'Almost ready…',
];

function useRotatingHint(active) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) { setIdx(0); return; }
    const t = setInterval(() => setIdx(i => (i + 1) % AI_HINTS.length), 2200);
    return () => clearInterval(t);
  }, [active]);
  return AI_HINTS[idx];
}

const CUISINES = [
  { name: 'Any',           emoji: '🌍' },
  { name: 'American',      emoji: '🍔' },
  { name: 'Italian',       emoji: '🍝' },
  { name: 'Mexican',       emoji: '🌮' },
  { name: 'Indian',        emoji: '🍛' },
  { name: 'Chinese',       emoji: '🥡' },
  { name: 'Japanese',      emoji: '🍣' },
  { name: 'Thai',          emoji: '🍜' },
  { name: 'Mediterranean', emoji: '🫒' },
  { name: 'French',        emoji: '🥐' },
  { name: 'Greek',         emoji: '🧆' },
  { name: 'Korean',        emoji: '🥩' },
  { name: 'Vietnamese',    emoji: '🍲' },
];

const MEAL_TYPES = [
  { name: 'Breakfast', emoji: '🌅', hint: 'Light & energizing to start the day' },
  { name: 'Lunch',     emoji: '🥗', hint: 'Balanced mid-day fuel' },
  { name: 'Dinner',    emoji: '🍽️', hint: 'Satisfying evening meal' },
  { name: 'Snack',     emoji: '🍎', hint: 'Quick bite between meals' },
];

const MACRO_FIELDS = [
  { name: 'protein',  label: 'Protein',  unit: 'g',    color: '#8b5cf6' },
  { name: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#f59e0b' },
  { name: 'fats',     label: 'Fat',      unit: 'g',    color: '#10b981' },
  { name: 'calories', label: 'Calories', unit: 'kcal', color: '#64748b' },
];

function MacroDonut({ macros }) {
  const size = 140;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;

  const p = (macros.protein || 0) * 4;
  const c = (macros.carbs || 0) * 4;
  const f = (macros.fats || 0) * 9;
  const total = p + c + f || 1;

  const pPct = p / total;
  const cPct = c / total;
  const fPct = f / total;

  const gap = circ * 0.015;
  const pLen = circ * pPct - gap;
  const cLen = circ * cPct - gap;
  const fLen = circ * fPct - gap;

  const pOff = 0;
  const cOff = -(pLen + gap);
  const fOff = cOff - (cLen + gap);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="currentColor" strokeWidth={stroke}
            className="text-gray-100 dark:text-white/5" />
          {pLen > 0 && (
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="#8b5cf6" strokeWidth={stroke}
              strokeDasharray={`${pLen} ${circ}`} strokeDashoffset={pOff}
              strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.4s ease' }} />
          )}
          {cLen > 0 && (
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f59e0b" strokeWidth={stroke}
              strokeDasharray={`${cLen} ${circ}`} strokeDashoffset={cOff}
              strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.4s ease' }} />
          )}
          {fLen > 0 && (
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="#10b981" strokeWidth={stroke}
              strokeDasharray={`${fLen} ${circ}`} strokeDashoffset={fOff}
              strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.4s ease' }} />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums leading-none">
            {macros.calories || 0}
          </span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">kcal</span>
        </div>
      </div>
      <div className="flex gap-3 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
          <span className="w-2 h-2 rounded-full bg-violet-500" />{macros.protein || 0}g P
        </span>
        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" />{macros.carbs || 0}g C
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{macros.fats || 0}g F
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-200 dark:border-white/8 p-5 animate-pulse">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-white/8 rounded-lg w-2/3" />
          <div className="h-3.5 bg-gray-100 dark:bg-white/5 rounded-lg w-1/2" />
        </div>
        <div className="h-8 w-8 bg-gray-100 dark:bg-white/5 rounded-lg" />
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full mb-3" />
      <div className="flex gap-2">
        {[80, 72, 60, 64].map(w => (
          <div key={w} className="h-6 bg-gray-100 dark:bg-white/5 rounded-full" style={{ width: `${w}px` }} />
        ))}
      </div>
    </div>
  );
}

const MEAL_TYPE_ORDER = MEAL_TYPES.map(m => m.name);

export default function MealSuggestionsPage({
  macros, cuisine, setCuisine, suggestions, loading, error,
  onInputChange, onSubmit, expandedIndex, setExpandedIndex,
  isFavorite, onSave, onRemove, mealType, setMealType,
  dayPlan, onAddToDay, setPage,
}) {
  const currentIdx = MEAL_TYPE_ORDER.indexOf(mealType);
  const nextMealType = MEAL_TYPE_ORDER[(currentIdx + 1) % MEAL_TYPE_ORDER.length];
  const filledCount = dayPlan ? Object.values(dayPlan).filter(Boolean).length : 0;
  const loadingHint = useRotatingHint(loading);

  return (
    <div className="flex-1 bg-white dark:bg-[#080810] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide uppercase mb-3">
                <FaBolt size={9} /> AI-Powered
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                Meal<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Suggestions</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-sm">
                Set your macro targets and get AI-crafted recipes matched to your goals.
              </p>
            </div>

            {/* Day plan progress */}
            {dayPlan && (
              <button
                onClick={() => setPage('dayplan')}
                className="shrink-0 flex flex-col items-end gap-2 p-3 rounded-2xl border border-gray-100 dark:border-white/8 hover:border-indigo-200 dark:hover:border-indigo-500/25 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group"
              >
                <div className="flex gap-1.5">
                  {MEAL_TYPES.map(({ name, emoji }) => (
                    <div key={name} title={name} className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
                      dayPlan[name]
                        ? 'bg-indigo-100 dark:bg-indigo-500/20'
                        : 'bg-gray-100 dark:bg-white/5 opacity-40'
                    }`}>
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  {filledCount}/4 planned · View →
                </span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid md:grid-cols-[1fr_auto] gap-5 mb-5">

            {/* Left: inputs + presets + cuisine */}
            <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-200 dark:border-white/8 p-6 space-y-7">

              {/* Meal type selector */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-3">Meal Type</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MEAL_TYPES.map(({ name, emoji, hint }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setMealType(name)}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all ${
                        mealType === name
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                          : 'bg-gray-50 dark:bg-white/4 border-gray-200 dark:border-white/6 text-gray-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-700 dark:hover:text-indigo-300'
                      }`}
                    >
                      <span className="text-xl leading-none">{emoji}</span>
                      <span className="text-[11px] font-bold">{name}</span>
                      <span className={`text-[9px] text-center leading-tight ${mealType === name ? 'text-indigo-200' : 'text-gray-400 dark:text-slate-600'}`}>{hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Macro number inputs */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-4">Your Targets</p>
                <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                  {MACRO_FIELDS.map(({ name, label, unit, color }) => (
                    <div key={name} className="group">
                      <div className="relative flex items-baseline gap-1.5">
                        <input
                          type="number"
                          inputMode="decimal"
                          name={name}
                          value={macros[name]}
                          onChange={onInputChange}
                          required
                          min="0"
                          placeholder="0"
                          className="w-full text-3xl font-black bg-transparent outline-none pb-2 text-gray-900 dark:text-white tabular-nums placeholder-gray-200 dark:placeholder-white/10 border-b-2 border-gray-200 dark:border-white/10 focus:border-current transition-colors"
                          style={{ '--tw-border-opacity': 1 }}
                          onFocus={e => e.target.style.borderColor = color}
                          onBlur={e => e.target.style.borderColor = ''}
                        />
                        <span className="text-sm font-medium text-gray-400 dark:text-slate-500 pb-2 shrink-0">{unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuisine */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-3">Cuisine</p>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map(({ name, emoji }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setCuisine(name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        cuisine === name
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{emoji}</span> {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: donut */}
            <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-200 dark:border-white/8 p-6 flex flex-col items-center justify-center gap-2 min-w-[180px]">
              <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-1">Macro Split</p>
              <MacroDonut macros={macros} />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Crafting meals…
                </>
              ) : (
                <>
                  Find Meals
                  <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2.5 rounded-xl border border-red-100 dark:border-red-500/20">{error}</p>
            )}
          </div>
        </form>

        {/* Loading skeletons */}
        {loading && (
          <div className="mt-10 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p key={loadingHint} className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase animate-fade-in">{loadingHint}</p>
            </div>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {!loading && suggestions.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase">
                  {suggestions.length} {mealType.toLowerCase()} ideas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSubmit}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-40 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                >
                  <FaRedo size={10} /> Regenerate
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => { setMealType(nextMealType); setTimeout(onSubmit, 50); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors disabled:opacity-40 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                >
                  Next: {MEAL_TYPES.find(m => m.name === nextMealType)?.emoji} {nextMealType} <FaChevronRight size={9} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <MealCard
                    meal={suggestion}
                    expanded={expandedIndex === index}
                    onExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    isFavorite={isFavorite(suggestion.meal)}
                    onSave={onSave}
                    onRemove={onRemove}
                    showSave={true}
                    showRemove={false}
                    onAddToDay={onAddToDay ? (meal) => onAddToDay(mealType, meal) : undefined}
                    isInDay={dayPlan?.[mealType]?.meal === suggestion.meal}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && suggestions.length === 0 && macros.protein && (
          <div className="mt-16 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🍽️
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">No suggestions yet</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Hit "Find Meals" to generate recipes matched to your targets.</p>
          </div>
        )}

      </div>
    </div>
  );
}
