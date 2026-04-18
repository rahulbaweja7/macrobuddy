import { FaTrash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const MEAL_TYPES = [
  { name: 'Breakfast', emoji: '🌅' },
  { name: 'Lunch',     emoji: '🥗' },
  { name: 'Dinner',    emoji: '🍽️' },
  { name: 'Snack',     emoji: '🍎' },
];

function MacroPill({ label, value, unit, color }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {value}{unit} <span className="font-normal opacity-70">{label}</span>
    </span>
  );
}

function MacroBar({ macros }) {
  const p = (macros.protein || 0) * 4;
  const c = (macros.carbs   || 0) * 4;
  const f = (macros.fats    || 0) * 9;
  const total = p + c + f || 1;
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden gap-px mt-3">
      <div className="bg-violet-500 rounded-l-full" style={{ width: `${(p/total)*100}%` }} />
      <div className="bg-amber-400"                 style={{ width: `${(c/total)*100}%` }} />
      <div className="bg-emerald-400 rounded-r-full" style={{ width: `${(f/total)*100}%` }} />
    </div>
  );
}

export default function DayPlanPage({ dayPlan, onRemove, setPage }) {
  const filled = MEAL_TYPES.filter(m => dayPlan[m.name]);
  const totals = filled.reduce((acc, m) => {
    const macros = dayPlan[m.name]?.macros || {};
    return {
      protein:  acc.protein  + (macros.protein  || 0),
      carbs:    acc.carbs    + (macros.carbs    || 0),
      fats:     acc.fats     + (macros.fats     || 0),
      calories: acc.calories + (macros.calories || 0),
    };
  }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

  return (
    <div className="flex-1 bg-white dark:bg-[#080810] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setPage('main')}
            className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Today's Plan</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {filled.length === 0 ? 'No meals added yet' : `${filled.length} of 4 meals planned`}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-3 mb-8">
          {MEAL_TYPES.map(({ name, emoji }) => {
            const meal = dayPlan[name];
            return (
              <div key={name} className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                meal
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/25'
                  : 'bg-gray-50 dark:bg-white/3 border-gray-100 dark:border-white/5'
              }`}>
                <span className="text-xl">{emoji}</span>
                <span className={`text-[10px] font-bold ${meal ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-600'}`}>{name}</span>
                {meal
                  ? <FaCheckCircle size={10} className="text-indigo-500" />
                  : <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-200 dark:border-white/10" />
                }
              </div>
            );
          })}
        </div>

        {/* Meal slots */}
        <div className="flex flex-col gap-4 mb-8">
          {MEAL_TYPES.map(({ name, emoji }) => {
            const meal = dayPlan[name];
            if (!meal) {
              return (
                <div key={name} className="rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 p-5 flex items-center gap-3">
                  <span className="text-2xl opacity-30">{emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-300 dark:text-slate-700">{name}</p>
                    <button
                      onClick={() => setPage('main')}
                      className="text-xs text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold mt-0.5 transition"
                    >
                      + Add {name.toLowerCase()} →
                    </button>
                  </div>
                </div>
              );
            }
            const macros = meal.macros || {};
            return (
              <div key={name} className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-100 dark:border-white/8 border-l-4 border-l-indigo-500 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{emoji}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-widest text-indigo-500 dark:text-indigo-400 uppercase">{name}</p>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug truncate">{meal.meal}</h3>
                      {meal.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{meal.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(name)}
                    className="p-2 rounded-xl text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition shrink-0"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>

                <MacroBar macros={macros} />

                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <MacroPill label="protein" value={macros.protein} unit="g" color="text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10" />
                  <MacroPill label="carbs"   value={macros.carbs}   unit="g" color="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10" />
                  <MacroPill label="fat"     value={macros.fats}    unit="g" color="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10" />
                  <MacroPill label="kcal"    value={macros.calories} unit="" color="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily totals */}
        {filled.length > 0 && (
          <div className="bg-gray-50 dark:bg-[#0e0e1a] rounded-2xl border border-gray-100 dark:border-white/8 p-5">
            <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-500 uppercase mb-4">Daily Totals</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: 'Protein',  val: totals.protein,  unit: 'g',    color: 'text-violet-600 dark:text-violet-400' },
                { label: 'Carbs',    val: totals.carbs,    unit: 'g',    color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Fat',      val: totals.fats,     unit: 'g',    color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Calories', val: totals.calories, unit: 'kcal', color: 'text-slate-600 dark:text-slate-300' },
              ].map(({ label, val, unit, color }) => (
                <div key={label}>
                  <p className={`text-2xl font-black tabular-nums ${color}`}>{Math.round(val)}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold mt-0.5">{unit} {label}</p>
                </div>
              ))}
            </div>
            <MacroBar macros={totals} />
          </div>
        )}

        {filled.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">Your day plan is empty</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">Go to Meal Suggestions and add meals for each slot.</p>
            <button
              onClick={() => setPage('main')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition"
            >
              Plan my meals →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
