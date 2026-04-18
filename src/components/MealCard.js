import { FaChevronDown, FaChevronUp, FaBookmark, FaRegBookmark, FaTrash, FaPlus, FaCheck } from 'react-icons/fa';

const normalizeInstruction = (input) => {
  const value = String(input ?? '').trim();
  return value
    .replace(/^(?:step\s*)?\d+\s*(?:[:\-\.]|\))\s*/i, '')
    .replace(/^\d+\.(?:\s*)/, '')
    .replace(/^\d+\)(?:\s*)/, '')
    .replace(/^[\u2022\-]\s*/, '')
    .trim();
};

function MacroBar({ macros }) {
  const total = (macros.protein || 0) + (macros.carbs || 0) + (macros.fats || 0);
  if (!total) return null;
  const p = ((macros.protein || 0) / total) * 100;
  const c = ((macros.carbs   || 0) / total) * 100;
  const f = ((macros.fats    || 0) / total) * 100;
  return (
    <div className="flex h-1 rounded-full overflow-hidden gap-px mt-3">
      <div className="bg-violet-500 rounded-l-full" style={{ width: `${p}%` }} />
      <div className="bg-amber-400" style={{ width: `${c}%` }} />
      <div className="bg-emerald-400 rounded-r-full" style={{ width: `${f}%` }} />
    </div>
  );
}

function MacroPills({ macros }) {
  return (
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
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${color}`}>
      {label} {num > 0 ? '+' : ''}{num}
    </span>
  );
};

export default function MealCard({ meal, expanded, onExpand, isFavorite, onSave, onRemove, showSave, showRemove, onAddToDay, isInDay }) {
  if (!meal) return null;
  const macros = meal.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 };

  return (
    <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-200 dark:border-white/8 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md dark:shadow-none transition-all duration-200 group/card">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{meal.meal || 'Untitled Meal'}</h3>
            {meal.description && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{meal.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            {onAddToDay && (
              <button
                onClick={e => { e.stopPropagation(); onAddToDay(meal); }}
                title={isInDay ? 'Added to today' : 'Add to today\'s plan'}
                className={`p-2 rounded-xl transition-all ${
                  isInDay
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15'
                    : 'text-gray-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                }`}
              >
                {isInDay ? <FaCheck size={12} /> : <FaPlus size={12} />}
              </button>
            )}
            {showSave && (
              <button
                onClick={e => { e.stopPropagation(); onSave?.(meal); }}
                title={isFavorite ? 'Saved' : 'Save to favorites'}
                className={`p-2 rounded-xl transition-all ${
                  isFavorite
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15'
                    : 'text-gray-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }`}
              >
                {isFavorite ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
              </button>
            )}
            {showRemove && (
              <button
                onClick={e => { e.stopPropagation(); onRemove?.(meal.id || meal._id); }}
                className="p-2 rounded-xl text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <FaTrash size={12} />
              </button>
            )}
            <button
              onClick={onExpand}
              className="p-2 rounded-xl text-gray-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
            >
              {expanded ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Macro proportion bar */}
        <MacroBar macros={macros} />

        {/* Macro pills */}
        <MacroPills macros={macros} />

        {/* Delta row */}
        {meal.difference && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <DeltaBadge label="P" value={meal.difference.protein} />
            <DeltaBadge label="C" value={meal.difference.carbs} />
            <DeltaBadge label="F" value={meal.difference.fats} />
            <DeltaBadge label="Cal" value={meal.difference.calories} />
          </div>
        )}

        {meal.savedAt && (
          <p className="text-xs text-gray-400 dark:text-slate-600 mt-2">
            Saved {new Date(meal.savedAt).toLocaleDateString()}
          </p>
        )}

        {/* Expand hint */}
        {!expanded && (
          <button
            onClick={onExpand}
            className="mt-3 text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            View recipe + instructions ↓
          </button>
        )}
      </div>

      {/* Expanded: recipe */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5 px-5 pb-5 pt-4">
          {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold tracking-[0.15em] text-gray-400 dark:text-slate-500 uppercase mb-3">Ingredients & Nutrition</h4>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/5">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/3 text-gray-500 dark:text-slate-500 uppercase tracking-wide">
                      {['Ingredient', 'State', 'Qty', 'P', 'C', 'F', 'kcal'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/4">
                    {meal.ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                        <td className="px-3 py-2 font-semibold text-gray-800 dark:text-slate-200">{ing.name}</td>
                        <td className="px-3 py-2 text-gray-400 dark:text-slate-500">{ing.state}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-slate-300 tabular-nums">{ing.quantity}</td>
                        <td className="px-3 py-2 text-violet-600 dark:text-violet-300 tabular-nums font-medium">{ing.protein}</td>
                        <td className="px-3 py-2 text-amber-600 dark:text-amber-300 tabular-nums font-medium">{ing.carbs}</td>
                        <td className="px-3 py-2 text-emerald-600 dark:text-emerald-300 tabular-nums font-medium">{ing.fats}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-slate-400 tabular-nums">{ing.calories}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Array.isArray(meal.instructions) && meal.instructions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] text-gray-400 dark:text-slate-500 uppercase mb-3">Instructions</h4>
              <ol className="space-y-3">
                {meal.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{normalizeInstruction(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button
            onClick={onExpand}
            className="mt-5 text-xs font-semibold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            ↑ Collapse
          </button>
        </div>
      )}
    </div>
  );
}
