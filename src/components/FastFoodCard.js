import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

export default function FastFoodCard({ meal, isFavorite, onSave, onRemove }) {
  const macros = meal.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 };

  return (
    <div className="bg-white dark:bg-[#0e0e1a] rounded-xl border border-gray-200 dark:border-white/8 border-l-4 border-l-orange-400 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{meal.meal}</h3>
          {meal.description && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{meal.description}</p>
          )}
        </div>
        <button
          onClick={() => isFavorite ? onRemove?.(meal.id || meal._id) : onSave?.(meal)}
          title={isFavorite ? 'Saved' : 'Save to favorites'}
          className={`p-2 rounded-lg transition-colors shrink-0 mt-0.5 ${isFavorite ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20' : 'text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'}`}
        >
          {isFavorite ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />{macros.protein}g protein
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{macros.carbs}g carbs
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />{macros.fats}g fats
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-300 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{macros.calories} kcal
        </span>
      </div>

      {meal.difference && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[['P', meal.difference.protein], ['C', meal.difference.carbs], ['F', meal.difference.fats], ['Cal', meal.difference.calories]].map(([label, val]) => {
            const num = Number(val);
            const color = num > 0
              ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
              : num < 0
              ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
              : 'text-gray-500 bg-gray-100 dark:text-slate-400 dark:bg-white/5';
            return (
              <span key={label} className={`text-xs font-medium px-2 py-0.5 rounded ${color}`}>
                {label} {num > 0 ? '+' : ''}{num}
              </span>
            );
          })}
        </div>
      )}

      {meal.customization && (
        <div className="mt-3 flex gap-2 text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg px-3 py-2 border border-indigo-100 dark:border-indigo-500/20">
          <span className="shrink-0 font-bold">Tip:</span>
          <span>{meal.customization}</span>
        </div>
      )}
    </div>
  );
}
