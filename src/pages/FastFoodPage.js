import React from 'react';
import FastFoodCard from '../components/FastFoodCard';

export default function FastFoodPage({
  ffMacros,
  setFFMacros,
  selectedChain,
  setSelectedChain,
  ffResults,
  ffLoading,
  ffError,
  onInputChange,
  onSubmit,
  isFavorite,
  onSave,
  onRemove,
  getFavoriteId,
  FAST_FOOD_CHAINS
}) {
  return (
    <section className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Find Fast Food Alternatives</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6">Enter your macro requirements and select a fast food chain to find matching menu items.</p>
      </div>
      <div className="max-w-2xl w-full mx-auto bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-8 mb-10">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-1">Fast Food Chain</label>
            <select value={selectedChain} onChange={e => setSelectedChain(e.target.value)} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200">
              {FAST_FOOD_CHAINS.map(chain => (
                <option key={chain} value={chain}>{chain}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Protein (g)</label>
            <input type="number" name="protein" value={ffMacros.protein} onChange={onInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Carbs (g)</label>
            <input type="number" name="carbs" value={ffMacros.carbs} onChange={onInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Fats (g)</label>
            <input type="number" name="fats" value={ffMacros.fats} onChange={onInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Calories</label>
            <input type="number" name="calories" value={ffMacros.calories} onChange={onInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
          </div>
          <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-4 mt-2">
            <button type="submit" disabled={ffLoading} className="w-full md:w-auto px-8 py-3 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3">
              {ffLoading && (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
              {ffLoading ? 'Getting Alternatives...' : 'Get Fast Food Alternatives'}
            </button>
            {ffError && (<div className="w-full md:w-auto text-center text-red-700 bg-red-100 rounded-lg py-2 px-4 font-semibold shadow animate-fade-in">{ffError}</div>)}
          </div>
        </form>
      </div>
      {ffResults.length > 0 && (
        <div className="max-w-2xl w-full mx-auto mt-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">Fast Food Alternatives</h2>
            <button 
              onClick={onSubmit}
              disabled={ffLoading}
              className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
            >
              {ffLoading && (<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
              Get New Alternatives
            </button>
          </div>
          <div className="flex flex-col gap-8">
            {ffResults.map((result, index) => (
              <FastFoodCard
                key={index}
                meal={result}
                isFavorite={isFavorite(result.meal)}
                onSave={onSave}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}