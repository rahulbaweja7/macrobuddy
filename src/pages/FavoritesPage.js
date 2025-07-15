import React from 'react';
import FavoritesList from '../components/FavoritesList';
import MealCard from '../components/MealCard';

export default function FavoritesPage({
  favorites,
  favoritesLoading,
  favoritesError,
  loadFavorites,
  expandedFavoriteId,
  setExpandedFavoriteId,
  onRemove,
  macros,
  setMacros,
  favoriteSuggestions,
  favoriteSuggestionsLoading,
  generateFavoriteSuggestions,
  expandedFavoriteSuggestionIndex,
  setExpandedFavoriteSuggestionIndex,
  onSave
}) {
  return (
    <section className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Your Favorite Meals</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6">Manage your saved meals and get personalized suggestions based on your preferences.</p>
      </div>
      {/* Favorite-based suggestions section */}
      {favorites.length > 0 && (
        <div className="max-w-4xl w-full mx-auto bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-8 mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Suggestions Based on Your Favorites</h2>
            <p className="text-gray-600 mb-4">Enter your macro requirements to get new meal suggestions that match your saved preferences.</p>
            <form onSubmit={e => { e.preventDefault(); generateFavoriteSuggestions(); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">Protein (g)</label>
                <input type="number" value={macros.protein} onChange={e => setMacros(prev => ({ ...prev, protein: e.target.value }))} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">Carbs (g)</label>
                <input type="number" value={macros.carbs} onChange={e => setMacros(prev => ({ ...prev, carbs: e.target.value }))} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">Fats (g)</label>
                <input type="number" value={macros.fats} onChange={e => setMacros(prev => ({ ...prev, fats: e.target.value }))} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-sm">Calories</label>
                <input type="number" value={macros.calories} onChange={e => setMacros(prev => ({ ...prev, calories: e.target.value }))} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm" required />
              </div>
              <div className="md:col-span-4">
                <button type="submit" disabled={favoriteSuggestionsLoading} className="w-full px-6 py-3 rounded-full bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3">
                  {favoriteSuggestionsLoading && (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
                  {favoriteSuggestionsLoading ? 'Generating...' : 'Get Personalized Suggestions'}
                </button>
              </div>
            </form>
          </div>
          {/* Favorite-based suggestions */}
          {favoriteSuggestions.length > 0 && (
            <div className="mt-8 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Personalized Suggestions Based on Your Favorites</h3>
              <div className="flex flex-col gap-6">
                {favoriteSuggestions.map((suggestion, index) => (
                  <MealCard
                    key={index}
                    meal={suggestion}
                    expanded={expandedFavoriteSuggestionIndex === index}
                    onExpand={() => setExpandedFavoriteSuggestionIndex(expandedFavoriteSuggestionIndex === index ? null : index)}
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
      {/* Favorites list */}
      <div className="max-w-4xl w-full mx-auto">
        {favoritesLoading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        ) : favoritesError ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{favoritesError}</p>
            <button onClick={loadFavorites} className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all duration-200">
              Try Again
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">★</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Favorite Meals Yet</h3>
            <p className="text-gray-600 mb-6">Start saving meals you love to get personalized suggestions!</p>
            <button onClick={loadFavorites} className="px-6 py-3 rounded-full bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all duration-200">
              Refresh
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-800">Saved Favorites ({favorites.length})</h2>
              <button 
                onClick={loadFavorites}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-semibold shadow hover:bg-gray-200 transition-all duration-200"
              >
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
    </section>
  );
} 