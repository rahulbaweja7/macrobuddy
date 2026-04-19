import { useState } from 'react';
import { FaBookmark, FaArrowRight, FaRedo, FaStar } from 'react-icons/fa';
import MealCard from '../components/MealCard';

const MACRO_FIELDS = [
  { name: 'protein',  label: 'Protein',  unit: 'g',    color: '#8b5cf6' },
  { name: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#f59e0b' },
  { name: 'fats',     label: 'Fat',      unit: 'g',    color: '#10b981' },
  { name: 'calories', label: 'Calories', unit: 'kcal', color: '#64748b' },
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
      <div className="h-1 bg-gray-100 dark:bg-white/5 rounded-full mb-3" />
      <div className="flex gap-2">
        {[80, 72, 60, 64].map(w => (
          <div key={w} className="h-6 bg-gray-100 dark:bg-white/5 rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

export default function FavoritesPage({
  favorites, favoritesLoading, favoritesError, loadFavorites,
  expandedFavoriteId, setExpandedFavoriteId, onRemove,
  macros, setMacros, favoriteSuggestions, favoriteSuggestionsLoading,
  generateFavoriteSuggestions, expandedFavoriteSuggestionIndex,
  setExpandedFavoriteSuggestionIndex, onSave,
}) {
  const [showSuggestForm, setShowSuggestForm] = useState(false);

  return (
    <div className="flex-1 bg-white dark:bg-[#080810] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Favorites</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Meals you've loved and saved.</p>
          </div>
          {favorites.length > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-1">
              {favorites.length} saved
            </span>
          )}
        </div>

        {/* AI taste profile card */}
        {favorites.length > 0 && (
          <div className="mb-6 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSuggestForm(v => !v)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 hover:from-indigo-100 dark:hover:from-indigo-500/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <FaStar size={13} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-gray-900 dark:text-white">Suggest from my taste</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">AI analyzes your {favorites.length} saved meals and generates new ones</p>
                </div>
              </div>
              <span className={`text-xs font-bold text-indigo-500 transition-transform duration-200 ${showSuggestForm ? 'rotate-90' : ''}`}>›</span>
            </button>

            {showSuggestForm && (
              <div className="bg-white dark:bg-[#0e0e1a] border-t border-indigo-100 dark:border-indigo-500/15 p-5">
                <form onSubmit={e => { e.preventDefault(); generateFavoriteSuggestions(); }}>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-4">Target Macros</p>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-5 mb-5">
                    {MACRO_FIELDS.map(({ name, label, unit, color }) => (
                      <div key={name}>
                        <div className="relative flex items-baseline gap-1.5">
                          <input
                            type="number"
                            value={macros[name]}
                            onChange={e => setMacros(prev => ({ ...prev, [name]: e.target.value }))}
                            required
                            min="0"
                            placeholder="0"
                            className="w-full text-2xl font-black bg-transparent outline-none pb-2 text-gray-900 dark:text-white tabular-nums placeholder-gray-200 dark:placeholder-white/10 border-b-2 border-gray-200 dark:border-white/10 transition-colors"
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
                  <button
                    type="submit"
                    disabled={favoriteSuggestionsLoading}
                    className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    {favoriteSuggestionsLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Generating…
                      </>
                    ) : (
                      <>
                        Generate for me
                        <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Suggestion results */}
                {favoriteSuggestionsLoading && (
                  <div className="mt-6 flex flex-col gap-3">
                    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                  </div>
                )}

                {!favoriteSuggestionsLoading && favoriteSuggestions.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-500 uppercase mb-3">
                      {favoriteSuggestions.length} suggestions for you
                    </p>
                    <div className="flex flex-col gap-3">
                      {favoriteSuggestions.map((s, i) => (
                        <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                          <MealCard
                            meal={s}
                            expanded={expandedFavoriteSuggestionIndex === i}
                            onExpand={() => setExpandedFavoriteSuggestionIndex(expandedFavoriteSuggestionIndex === i ? null : i)}
                            isFavorite={false}
                            onSave={onSave}
                            showSave={true}
                            showRemove={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Favorites list */}
        {favoritesLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : favoritesError ? (
          <div className="text-center py-16">
            <p className="text-sm text-red-500 dark:text-red-400 mb-4">{favoritesError}</p>
            <button onClick={loadFavorites} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition">
              Try again
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
              🔖
            </div>
            <h3 className="text-base font-black text-gray-800 dark:text-white mb-1">Nothing saved yet</h3>
            <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs mx-auto">
              Hit the bookmark icon on any meal in Meal Suggestions or Fast Food to save it here.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-500 uppercase">
                {favorites.length} saved meal{favorites.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={loadFavorites}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                <FaRedo size={10} /> Refresh
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {favorites.map((fav, i) => (
                <div key={fav.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <MealCard
                    meal={fav}
                    expanded={expandedFavoriteId === fav.id}
                    onExpand={() => setExpandedFavoriteId(expandedFavoriteId === fav.id ? null : fav.id)}
                    isFavorite={true}
                    onRemove={onRemove}
                    showSave={false}
                    showRemove={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
