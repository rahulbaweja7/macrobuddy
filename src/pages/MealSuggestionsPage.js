import React from 'react';
import MealCard from '../components/MealCard';

export default function MealSuggestionsPage({
  macros,
  setMacros,
  cuisine,
  setCuisine,
  suggestions,
  loading,
  error,
  onInputChange,
  onSubmit,
  expandedIndex,
  setExpandedIndex,
  isFavorite,
  onSave,
  onRemove,
  getFavoriteId
}) {
  const CUISINES = [
    'Any', 'American', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'Mediterranean', 'French', 'Greek', 'Middle Eastern', 'Korean', 'Vietnamese', 'Spanish', 'African',
  ];
  return (
    <section className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Create Custom Macro-Based Meal Suggestions</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6">Enter your macro requirements and get meal ideas tailored just for you. Perfect for fitness, health, and meal planning!</p>
      </div>
      <div className="max-w-2xl w-full mx-auto bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-8 mb-10">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-1">Cuisine</label>
            <select value={cuisine} onChange={e => setCuisine(e.target.value)} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200">
              {CUISINES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Protein (g)</label>
            <input type="number" name="protein" value={macros.protein} onChange={onInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Carbs (g)</label>
            <input type="number" name="carbs" value={macros.carbs} onChange={onInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Fats (g)</label>
            <input type="number" name="fats" value={macros.fats} onChange={onInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Calories</label>
            <input type="number" name="calories" value={macros.calories} onChange={onInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
          </div>
          <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-4 mt-2">
            <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3">
              {loading && (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
              {loading ? 'Getting Suggestions...' : 'Get Meal Suggestions'}
            </button>
            {error && (<div className="w-full md:w-auto text-center text-red-700 bg-red-100 rounded-lg py-2 px-4 font-semibold shadow animate-fade-in">{error}</div>)}
          </div>
        </form>
      </div>
      {suggestions.length > 0 && (
        <div className="max-w-2xl w-full mx-auto mt-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">Meal Suggestions</h2>
            <button 
              onClick={onSubmit}
              disabled={loading}
              className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
            >
              {loading && (<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
              Get New Suggestions
            </button>
          </div>
          <div className="flex flex-col gap-8">
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
    </section>
  );
}