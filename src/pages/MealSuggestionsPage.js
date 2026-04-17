import { FaArrowRight, FaRedo, FaBookmark } from 'react-icons/fa';
import MealCard from '../components/MealCard';

const CUISINES = [
  'Any', 'American', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese',
  'Thai', 'Mediterranean', 'French', 'Greek', 'Middle Eastern', 'Korean',
  'Vietnamese', 'Spanish', 'African',
];

const MACRO_FIELDS = [
  { name: 'protein',  label: 'Protein',  unit: 'g',    dot: 'bg-violet-500',  border: 'focus:border-violet-500',  text: 'text-violet-600 dark:text-violet-400' },
  { name: 'carbs',    label: 'Carbs',    unit: 'g',    dot: 'bg-amber-500',   border: 'focus:border-amber-500',   text: 'text-amber-600 dark:text-amber-400'   },
  { name: 'fats',     label: 'Fat',      unit: 'g',    dot: 'bg-emerald-500', border: 'focus:border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400'},
  { name: 'calories', label: 'Calories', unit: 'kcal', dot: 'bg-slate-500',   border: 'focus:border-slate-400',   text: 'text-slate-600 dark:text-slate-400'   },
];

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

function TargetSummary({ macros }) {
  const fields = [
    { label: 'Protein', val: macros.protein, unit: 'g', color: 'text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10' },
    { label: 'Carbs',   val: macros.carbs,   unit: 'g', color: 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10'     },
    { label: 'Fat',     val: macros.fats,    unit: 'g', color: 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10'},
    { label: 'Calories',val: macros.calories,unit: 'kcal',color:'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/8'        },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {fields.map(({ label, val, unit, color }) => (
        <span key={label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
          {val}{unit} <span className="font-normal opacity-70">{label}</span>
        </span>
      ))}
    </div>
  );
}

export default function MealSuggestionsPage({
  macros, cuisine, setCuisine, suggestions, loading, error,
  onInputChange, onSubmit, expandedIndex, setExpandedIndex,
  isFavorite, onSave, onRemove,
}) {
  return (
    <div className="flex-1 bg-white dark:bg-[#080810]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Meal Suggestions</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Set your targets and get AI-matched recipes in seconds.</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-200 dark:border-white/8 p-6 mb-4">

            {/* Big macro inputs */}
            <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-5">Your targets</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-7">
              {MACRO_FIELDS.map(({ name, label, unit, dot, border, text }) => (
                <div key={name} className="group">
                  <input
                    type="number"
                    name={name}
                    value={macros[name]}
                    onChange={onInputChange}
                    required
                    min="0"
                    placeholder="0"
                    className={`w-full text-3xl font-black bg-transparent border-b-2 border-gray-200 dark:border-white/10 ${border} outline-none pb-2 text-gray-900 dark:text-white tabular-nums transition-colors placeholder-gray-300 dark:placeholder-white/10`}
                  />
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                    <span className={`text-xs font-semibold ${text}`}>{label}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-600 ml-auto">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cuisine pills */}
            <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-3">Cuisine</p>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCuisine(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    cuisine === c
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Finding meals…
                </>
              ) : (
                <>
                  Find meals
                  <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl border border-red-100 dark:border-red-500/20">{error}</p>
            )}
          </div>
        </form>

        {/* Loading skeletons */}
        {loading && (
          <div className="mt-10 flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-1">Generating…</p>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {!loading && suggestions.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase">
                {suggestions.length} meals found
              </p>
              <button
                onClick={onSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors disabled:opacity-40"
              >
                <FaRedo size={10} /> Regenerate
              </button>
            </div>

            <TargetSummary macros={macros} />

            <div className="flex flex-col gap-3">
              {suggestions.map((suggestion, index) => (
                <MealCard
                  key={index}
                  meal={suggestion}
                  expanded={expandedIndex === index}
                  onExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  isFavorite={isFavorite(suggestion.meal)}
                  onSave={onSave}
                  onRemove={onRemove}
                  showSave={true}
                  showRemove={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state after submit */}
        {!loading && suggestions.length === 0 && macros.protein && (
          <div className="mt-16 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaBookmark className="text-gray-300 dark:text-slate-600" size={18} />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">No suggestions yet</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Hit "Find meals" to generate recipes matched to your targets.</p>
          </div>
        )}

      </div>
    </div>
  );
}
