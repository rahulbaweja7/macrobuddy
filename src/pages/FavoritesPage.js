import { FaRegBookmark } from 'react-icons/fa';
import FavoritesList from '../components/FavoritesList';
import MealCard from '../components/MealCard';

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

export default function FavoritesPage({
  favorites, favoritesLoading, favoritesError, loadFavorites,
  expandedFavoriteId, setExpandedFavoriteId, onRemove,
  macros, setMacros, favoriteSuggestions, favoriteSuggestionsLoading,
  generateFavoriteSuggestions, expandedFavoriteSuggestionIndex,
  setExpandedFavoriteSuggestionIndex, onSave,
}) {
  return (
    <div className="flex-1 bg-white dark:bg-[#080810]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Favorites</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Your saved meals and personalized suggestions.</p>
        </div>

        {favorites.length > 0 && (
          <div className="bg-white dark:bg-[#0e0e1a] rounded-xl border border-gray-200 dark:border-white/8 shadow-sm dark:shadow-none p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Get suggestions from your taste profile</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">We'll analyze your saved meals and suggest new ones that match your style.</p>
            <form
              onSubmit={e => { e.preventDefault(); generateFavoriteSuggestions(); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'protein', label: 'Protein (g)' },
                  { key: 'carbs',   label: 'Carbs (g)' },
                  { key: 'fats',    label: 'Fats (g)' },
                  { key: 'calories',label: 'Calories' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{label}</label>
                    <input
                      type="number"
                      value={macros[key]}
                      onChange={e => setMacros(prev => ({ ...prev, [key]: e.target.value }))}
                      required
                      min="0"
                      className="w-full rounded-lg px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={favoriteSuggestionsLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {favoriteSuggestionsLoading && <Spinner />}
                {favoriteSuggestionsLoading ? 'Generating…' : 'Generate personalized suggestions'}
              </button>
            </form>

            {favoriteSuggestions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  Suggestions for you
                </h3>
                <div className="flex flex-col gap-3">
                  {favoriteSuggestions.map((s, i) => (
                    <MealCard
                      key={i}
                      meal={s}
                      expanded={expandedFavoriteSuggestionIndex === i}
                      onExpand={() => setExpandedFavoriteSuggestionIndex(expandedFavoriteSuggestionIndex === i ? null : i)}
                      isFavorite={false}
                      onSave={onSave}
                      showSave={true}
                      showRemove={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {favoritesLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400 dark:text-slate-500">
            <Spinner /> <span className="text-sm">Loading favorites…</span>
          </div>
        ) : favoritesError ? (
          <div className="text-center py-16">
            <p className="text-sm text-red-500 dark:text-red-400 mb-3">{favoritesError}</p>
            <button onClick={loadFavorites} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">
              Try again
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRegBookmark className="text-gray-400 dark:text-slate-500" size={18} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">No favorites yet</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Save meals from Meal Suggestions or Fast Food to see them here.</p>
            <button onClick={loadFavorites} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10 transition">
              Refresh
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                {favorites.length} saved meal{favorites.length !== 1 ? 's' : ''}
              </h2>
              <button onClick={loadFavorites} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                Refresh
              </button>
            </div>
            <FavoritesList
              favorites={favorites}
              expandedId={expandedFavoriteId}
              onExpand={id => setExpandedFavoriteId(expandedFavoriteId === id ? null : id)}
              onRemove={onRemove}
            />
          </div>
        )}
      </div>
    </div>
  );
}
