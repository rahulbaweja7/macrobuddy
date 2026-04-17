import MealCard from '../components/MealCard';

const CUISINES = [
  'Any', 'American', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese',
  'Thai', 'Mediterranean', 'French', 'Greek', 'Middle Eastern', 'Korean',
  'Vietnamese', 'Spanish', 'African',
];

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

export default function MealSuggestionsPage({
  macros, cuisine, setCuisine, suggestions, loading, error,
  onInputChange, onSubmit, expandedIndex, setExpandedIndex,
  isFavorite, onSave, onRemove, getFavoriteId,
}) {
  return (
    <div className="flex-1 bg-white dark:bg-[#080810]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meal Suggestions</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Enter your macro targets and get AI-matched recipes.</p>
        </div>

        <div className="bg-white dark:bg-[#0e0e1a] rounded-xl border border-gray-200 dark:border-white/8 shadow-sm dark:shadow-none p-6 mb-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Cuisine</label>
              <select
                value={cuisine}
                onChange={e => setCuisine(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500/50"
              >
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'protein', label: 'Protein', unit: 'g' },
                { name: 'carbs',   label: 'Carbs',   unit: 'g' },
                { name: 'fats',    label: 'Fats',    unit: 'g' },
                { name: 'calories',label: 'Calories',unit: 'kcal' },
              ].map(({ name, label, unit }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    {label} <span className="text-gray-400 dark:text-slate-500 font-normal">({unit})</span>
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={macros[name]}
                    onChange={onInputChange}
                    required
                    min="0"
                    className="w-full rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {loading && <Spinner />}
                {loading ? 'Finding meals…' : 'Get suggestions'}
              </button>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg border border-red-100 dark:border-red-500/20">{error}</p>
              )}
            </div>
          </form>
        </div>

        {suggestions.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                {suggestions.length} suggestions
              </h2>
              <button
                onClick={onSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-60 transition"
              >
                {loading && <Spinner />}
                Refresh
              </button>
            </div>
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
      </div>
    </div>
  );
}
