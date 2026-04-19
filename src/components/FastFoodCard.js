import { FaBookmark, FaRegBookmark, FaLightbulb } from 'react-icons/fa';

function MacroBar({ macros }) {
  const p = (macros.protein || 0) * 4;
  const c = (macros.carbs   || 0) * 4;
  const f = (macros.fats    || 0) * 9;
  const t = p + c + f || 1;
  return (
    <div className="flex h-1 rounded-full overflow-hidden gap-px mt-3">
      <div className="bg-violet-500 rounded-l-full" style={{ width: `${(p/t)*100}%` }} />
      <div className="bg-amber-400"                 style={{ width: `${(c/t)*100}%` }} />
      <div className="bg-emerald-400 rounded-r-full" style={{ width: `${(f/t)*100}%` }} />
    </div>
  );
}

const DeltaBadge = ({ label, value }) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  const color = num > 0
    ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
    : num < 0
    ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
    : 'text-gray-500 bg-gray-100 dark:text-slate-400 dark:bg-white/5';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${color}`}>
      {label} {num > 0 ? '+' : ''}{num}
    </span>
  );
};

export default function FastFoodCard({ meal, isFavorite, onSave, onRemove }) {
  const macros = meal.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 };

  return (
    <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-200 dark:border-white/8 border-l-4 border-l-orange-400 shadow-sm hover:shadow-md dark:shadow-none transition-all duration-200">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{meal.meal}</h3>
            {meal.description && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{meal.description}</p>
            )}
          </div>
          <button
            onClick={() => isFavorite ? onRemove?.(meal.id || meal._id) : onSave?.(meal)}
            title={isFavorite ? 'Saved' : 'Save to favorites'}
            className={`p-2 rounded-xl transition-all shrink-0 mt-0.5 ${
              isFavorite
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15'
                : 'text-gray-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
            }`}
          >
            {isFavorite ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
          </button>
        </div>

        {/* Macro bar */}
        <MacroBar macros={macros} />

        {/* Macro pills */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />{macros.protein}g protein
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{macros.carbs}g carbs
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />{macros.fats}g fat
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{macros.calories} kcal
          </span>
        </div>

        {/* Delta badges */}
        {meal.difference && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <DeltaBadge label="P" value={meal.difference.protein} />
            <DeltaBadge label="C" value={meal.difference.carbs} />
            <DeltaBadge label="F" value={meal.difference.fats} />
            <DeltaBadge label="Cal" value={meal.difference.calories} />
          </div>
        )}

        {/* Customization tip */}
        {meal.customization && (
          <div className="mt-3 flex gap-2 items-start text-xs text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-500/10 rounded-xl px-3 py-2.5 border border-orange-100 dark:border-orange-500/20">
            <FaLightbulb size={11} className="shrink-0 mt-0.5" />
            <span>{meal.customization}</span>
          </div>
        )}
      </div>
    </div>
  );
}
