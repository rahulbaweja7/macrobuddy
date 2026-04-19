import { useState } from 'react';
import { FaArrowRight, FaRedo, FaSearch } from 'react-icons/fa';
import FastFoodCard from '../components/FastFoodCard';

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
      <div className="flex gap-2">
        {[80, 72, 60, 64].map(w => (
          <div key={w} className="h-6 bg-gray-100 dark:bg-white/5 rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

export default function FastFoodPage({
  ffMacros, selectedChain, setSelectedChain, ffResults, ffLoading, ffError, ffNoNewOptions,
  onInputChange, onSubmit, isFavorite, onSave, onRemove, FAST_FOOD_CHAINS,
}) {
  const [search, setSearch] = useState('');

  const filtered = FAST_FOOD_CHAINS.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-white dark:bg-[#080810] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Fast Food<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Finder</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-sm">
            Find real menu items that match your macros within ±10%.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-200 dark:border-white/8 p-6 mb-4 space-y-7">

            {/* Chain search + picker */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-3">Restaurant</p>
              <div className="relative mb-3">
                <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search chains…"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/50 transition"
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {filtered.map(chain => (
                  <button
                    key={chain}
                    type="button"
                    onClick={() => setSelectedChain(chain)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedChain === chain
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {chain}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-slate-600 py-2">No chains match "{search}"</p>
                )}
              </div>
            </div>

            {/* Macro inputs */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase mb-4">Your Targets</p>
              <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                {MACRO_FIELDS.map(({ name, label, unit, color }) => (
                  <div key={name}>
                    <div className="relative flex items-baseline gap-1.5">
                      <input
                        type="number"
                        name={name}
                        value={ffMacros[name]}
                        onChange={onInputChange}
                        required
                        min="0"
                        placeholder="0"
                        className="w-full text-3xl font-black bg-transparent outline-none pb-2 text-gray-900 dark:text-white tabular-nums placeholder-gray-200 dark:placeholder-white/10 border-b-2 border-gray-200 dark:border-white/10 transition-colors"
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
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={ffLoading}
              className="group flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-bold disabled:opacity-60 transition-all shadow-lg shadow-orange-500/25"
            >
              {ffLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Searching…
                </>
              ) : (
                <>
                  Find Options
                  <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            {ffError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2.5 rounded-xl border border-red-100 dark:border-red-500/20">{ffError}</p>
            )}
          </div>
        </form>

        {/* Loading skeletons */}
        {ffLoading && (
          <div className="mt-10 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase">Scanning menu…</p>
            </div>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {!ffLoading && ffResults.length > 0 && (
          <div className="mt-10">
            {ffNoNewOptions && (
              <div className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                <span className="text-base">🤷</span>
                These are the only menu items at {selectedChain} that match your macros. Try adjusting your targets or switching chains.
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-600 uppercase">
                  {ffResults.length} matches at {selectedChain}
                </p>
              </div>
              <button
                onClick={onSubmit}
                disabled={ffLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors disabled:opacity-40 px-3 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10"
              >
                <FaRedo size={10} /> Refresh
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {ffResults.map((result, index) => (
                <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <FastFoodCard
                    meal={result}
                    isFavorite={isFavorite(result.meal)}
                    onSave={onSave}
                    onRemove={onRemove}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!ffLoading && ffResults.length === 0 && ffMacros.protein && (
          <div className="mt-16 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🍔
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">No results yet</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Pick a chain and hit "Find Options".</p>
          </div>
        )}

      </div>
    </div>
  );
}
