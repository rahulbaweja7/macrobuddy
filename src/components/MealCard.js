import { FaChevronDown, FaChevronUp, FaBookmark, FaRegBookmark, FaTrash } from 'react-icons/fa';

const MacroPills = ({ macros }) => (
  <div className="flex flex-wrap gap-1.5 mt-3">
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
      {macros.protein}g protein
    </span>
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
      {macros.carbs}g carbs
    </span>
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
      {macros.fats}g fats
    </span>
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-300 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
      {macros.calories} kcal
    </span>
  </div>
);

const DeltaBadge = ({ label, value }) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  const color = num > 0
    ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
    : num < 0
    ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
    : 'text-gray-500 bg-gray-100 dark:text-slate-400 dark:bg-white/5';
  const sign = num > 0 ? '+' : '';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${color}`}>
      {label} {sign}{num}
    </span>
  );
};

const normalizeInstruction = (input) => {
  const value = String(input ?? '').trim();
  return value
    .replace(/^(?:step\s*)?\d+\s*(?:[:\-\.]|\))\s*/i, '')
    .replace(/^\d+\.(?:\s*)/, '')
    .replace(/^\d+\)(?:\s*)/, '')
    .replace(/^[\u2022\-]\s*/, '')
    .trim();
};

export default function MealCard({ meal, expanded, onExpand, isFavorite, onSave, onRemove, showSave, showRemove }) {
  if (!meal) return null;
  const macros = meal.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 };

  return (
    <div className="bg-white dark:bg-[#0e0e1a] rounded-xl border border-gray-200 dark:border-white/8 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{meal.meal || 'Untitled Meal'}</h3>
            {meal.description && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{meal.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {showSave && (
              <button
                onClick={e => { e.stopPropagation(); onSave?.(meal); }}
                title={isFavorite ? 'Saved' : 'Save to favorites'}
                className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20' : 'text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'}`}
              >
                {isFavorite ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
              </button>
            )}
            {showRemove && (
              <button
                onClick={e => { e.stopPropagation(); onRemove?.(meal.id || meal._id); }}
                title="Remove from favorites"
                className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <FaTrash size={13} />
              </button>
            )}
            <button
              onClick={onExpand}
              className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
              title={expanded ? 'Hide recipe' : 'View recipe'}
            >
              {expanded ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </button>
          </div>
        </div>

        <MacroPills macros={macros} />

        {meal.difference && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <DeltaBadge label="P" value={meal.difference.protein} />
            <DeltaBadge label="C" value={meal.difference.carbs} />
            <DeltaBadge label="F" value={meal.difference.fats} />
            <DeltaBadge label="Cal" value={meal.difference.calories} />
          </div>
        )}

        {meal.savedAt && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
            Saved {new Date(meal.savedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5 px-5 pb-5 pt-4 animate-fade-in">
          {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Ingredients & Nutrition</h4>
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-white/5">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                      {['Ingredient', 'State', 'Quantity', 'P', 'C', 'F', 'kcal'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {meal.ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-slate-200">{ing.name}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{ing.state}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-slate-300">{ing.quantity}</td>
                        <td className="px-3 py-2 text-violet-700 dark:text-violet-300">{ing.protein}</td>
                        <td className="px-3 py-2 text-amber-700 dark:text-amber-300">{ing.carbs}</td>
                        <td className="px-3 py-2 text-emerald-700 dark:text-emerald-300">{ing.fats}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-slate-300">{ing.calories}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Array.isArray(meal.instructions) && meal.instructions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Instructions</h4>
              <ol className="space-y-2">
                {meal.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-700 dark:text-slate-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{normalizeInstruction(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
