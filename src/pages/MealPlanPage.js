import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSpinner, FaBolt, FaTrash, FaPlus, FaExchangeAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../utils/api';

const SLOTS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', grad: 'from-amber-500 to-orange-500',   border: 'border-l-amber-400'   },
  { key: 'lunch',     label: 'Lunch',     emoji: '🥗', grad: 'from-emerald-500 to-teal-500',   border: 'border-l-emerald-400' },
  { key: 'dinner',    label: 'Dinner',    emoji: '🍽️', grad: 'from-indigo-500 to-violet-500',  border: 'border-l-indigo-500'  },
  { key: 'snack',     label: 'Snack',     emoji: '🍎', grad: 'from-rose-500 to-pink-500',      border: 'border-l-rose-400'    },
];

function formatDate(d) { return d.toISOString().split('T')[0]; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function sameDay(a, b) { return formatDate(a) === formatDate(b); }

function MacroBar({ macros }) {
  const p = (macros?.protein || 0) * 4;
  const c = (macros?.carbs   || 0) * 4;
  const f = (macros?.fats    || 0) * 9;
  const t = p + c + f || 1;
  return (
    <div className="flex h-1 rounded-full overflow-hidden gap-px my-3">
      <div className="bg-violet-500 rounded-l-full transition-all duration-500" style={{ width: `${(p/t)*100}%` }} />
      <div className="bg-amber-400 transition-all duration-500"                  style={{ width: `${(c/t)*100}%` }} />
      <div className="bg-emerald-400 rounded-r-full transition-all duration-500" style={{ width: `${(f/t)*100}%` }} />
    </div>
  );
}

function MacroPills({ macros }) {
  if (!macros) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />{macros.protein}g P
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{macros.carbs}g C
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{macros.fats}g F
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />{macros.calories} kcal
      </span>
    </div>
  );
}

// ── Week strip ────────────────────────────────────────────────────────────────
function WeekStrip({ selectedDate, onChange }) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  const LABELS = ['S','M','T','W','T','F','S'];

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setWeekStart(d => addDays(d, -7))}
        className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition shrink-0"
      >
        <FaChevronLeft size={11} />
      </button>

      <div className="flex gap-1 flex-1 justify-between">
        {days.map((d, i) => {
          const isSelected = sameDay(d, selectedDate);
          const isToday = sameDay(d, today);
          return (
            <button
              key={i}
              onClick={() => onChange(d)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all flex-1 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : isToday
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              <span className="text-[10px] font-bold uppercase">{LABELS[i]}</span>
              <span className="text-sm font-black">{d.getDate()}</span>
              <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/40' : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setWeekStart(d => addDays(d, 7))}
        className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition shrink-0"
      >
        <FaChevronRight size={11} />
      </button>
    </div>
  );
}

// ── Meal picker modal ─────────────────────────────────────────────────────────
function MealPickerModal({ slot, onClose, onSelect }) {
  const [tab, setTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(true);
  const [macros, setMacros] = useState({ protein: '', carbs: '', fats: '', calories: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');

  const slotInfo = SLOTS.find(s => s.key === slot) || {};

  useEffect(() => {
    api.get('/api/favorites')
      .then(r => setFavorites(r.data.favorites))
      .catch(() => {})
      .finally(() => setFavLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!macros.protein || !macros.carbs || !macros.fats || !macros.calories) { setSuggestError('Fill in all fields.'); return; }
    setSuggestError(''); setSuggestLoading(true);
    try {
      const res = await api.post('/api/suggest-meals', {
        macros,
        mealType: slotInfo.label,
        preferences: 'healthy, balanced meals',
      });
      setSuggestions(res.data.suggestions || []);
    } catch { setSuggestError('Failed to generate. Try again.'); }
    finally { setSuggestLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-lg bg-white dark:bg-[#0e0e1a] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden border-0 sm:border border-white/8 max-h-[85vh] flex flex-col">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/8 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{slotInfo.emoji}</span>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-slate-500 uppercase">Adding to</p>
              <h3 className="text-base font-black text-gray-900 dark:text-white">{slotInfo.label}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition">
            <FaTimes size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-white/8 shrink-0">
          {[['favorites','⭐ Favorites'],['generate','✨ Generate']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-bold tracking-wide uppercase transition ${
                tab === t ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white'
              }`}>{label}</button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {tab === 'favorites' && (
            favLoading
              ? <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-indigo-400 text-xl" /></div>
              : favorites.length === 0
              ? <div className="text-center py-12"><p className="text-3xl mb-3">⭐</p><p className="text-sm font-bold text-gray-700 dark:text-slate-300">No favorites yet</p><p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Save meals from Meal Suggestions first.</p></div>
              : <div className="flex flex-col gap-2">
                  {favorites.map(fav => (
                    <button key={fav._id || fav.id} onClick={() => onSelect(fav)}
                      className="text-left p-4 rounded-2xl border border-gray-100 dark:border-white/8 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/8 transition group">
                      <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition">{fav.meal}</div>
                      {fav.description && <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{fav.description}</div>}
                      <div className="mt-2"><MacroPills macros={fav.macros} /></div>
                    </button>
                  ))}
                </div>
          )}

          {tab === 'generate' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {[['protein','Protein','g','#8b5cf6'],['carbs','Carbs','g','#f59e0b'],['fats','Fat','g','#10b981'],['calories','Calories','kcal','#64748b']].map(([f,l,u,c]) => (
                  <div key={f}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c }} />
                      <span className="text-xs font-semibold" style={{ color: c }}>{l}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-600 ml-auto">{u}</span>
                    </div>
                    <input type="number" value={macros[f]} placeholder="0"
                      onChange={e => setMacros(p => ({ ...p, [f]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 transition" />
                  </div>
                ))}
              </div>
              {suggestError && <p className="text-xs text-red-400">{suggestError}</p>}
              <button onClick={handleGenerate} disabled={suggestLoading}
                className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold transition disabled:opacity-60 flex items-center justify-center gap-2">
                {suggestLoading ? <><FaSpinner className="animate-spin" />Generating…</> : '✨ Generate Suggestions'}
              </button>
              {suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => onSelect(s)}
                      className="text-left p-4 rounded-2xl border border-gray-100 dark:border-white/8 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/8 transition group">
                      <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition">{s.meal}</div>
                      {s.description && <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{s.description}</div>}
                      <div className="mt-2"><MacroPills macros={s.macros} /></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MealPlanPage({ suggestedDayPlan, onRemoveSuggested, onClearSuggested, setPage }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayPlan, setDayPlan] = useState({ breakfast: null, lunch: null, dinner: null, snack: null });
  const [planLoading, setPlanLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const dateKey = formatDate(selectedDate);
  const isToday = sameDay(selectedDate, new Date());

  const fetchPlan = useCallback(async (date) => {
    setPlanLoading(true);
    try {
      const res = await api.get(`/api/mealplan?date=${date}`);
      setDayPlan({
        breakfast: res.data.plan?.breakfast || null,
        lunch:     res.data.plan?.lunch     || null,
        dinner:    res.data.plan?.dinner    || null,
        snack:     res.data.plan?.snack     || null,
      });
    } catch {
      setDayPlan({ breakfast: null, lunch: null, dinner: null, snack: null });
    } finally { setPlanLoading(false); }
  }, []);

  useEffect(() => { fetchPlan(dateKey); }, [dateKey, fetchPlan]);

  const handleSelectMeal = async (slot, meal) => {
    setActiveModal(null);
    try {
      await api.post('/api/mealplan', { date: dateKey, slot, meal });
      setDayPlan(p => ({ ...p, [slot]: meal }));
    } catch {}
    return true;
  };

  const handleRemoveMeal = async (slot) => {
    try {
      await api.delete(`/api/mealplan/${dateKey}/${slot}`);
      setDayPlan(p => ({ ...p, [slot]: null }));
    } catch {}
  };

  const totals = SLOTS.reduce((acc, { key }) => {
    const m = dayPlan[key]?.macros;
    if (!m) return acc;
    return { protein: acc.protein + (m.protein||0), carbs: acc.carbs + (m.carbs||0), fats: acc.fats + (m.fats||0), calories: acc.calories + (m.calories||0) };
  }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

  const mealsLogged = SLOTS.filter(({ key }) => dayPlan[key]).length;

  const suggestedMeals = suggestedDayPlan ? SLOTS.filter(s => suggestedDayPlan[s.label]) : [];

  const saveAllSuggested = async () => {
    const today = formatDate(new Date());
    for (const slot of suggestedMeals) {
      const meal = suggestedDayPlan[slot.label];
      if (meal) { try { await api.post('/api/mealplan', { date: today, slot: slot.key, meal }); } catch {} }
    }
    if (dateKey === today) fetchPlan(today);
    onClearSuggested?.();
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#080810] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-slate-500 uppercase mb-1">
              {isToday ? 'Today' : selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}
            </p>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
            </h1>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full mb-1 ${
            mealsLogged === SLOTS.length
              ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-white/6 text-gray-500 dark:text-slate-400'
          }`}>
            {mealsLogged}/{SLOTS.length} meals
          </span>
        </div>

        {/* Week strip */}
        <div className="bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-100 dark:border-white/8 p-3 mb-6">
          <WeekStrip selectedDate={selectedDate} onChange={setSelectedDate} />
        </div>

        {/* Suggestions strip */}
        {suggestedMeals.length > 0 && (
          <div className="mb-5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaBolt size={10} className="text-indigo-500" />
                <p className="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">From Suggestions</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPage?.('main')} className="text-xs font-semibold text-gray-400 hover:text-indigo-500 transition">Edit</button>
                <button onClick={saveAllSuggested} className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition">Save all</button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {suggestedMeals.map(slot => {
                const meal = suggestedDayPlan[slot.label];
                return (
                  <div key={slot.key} className="flex items-center gap-3 bg-white dark:bg-[#0e0e1a] rounded-xl px-3 py-2.5 border border-indigo-100 dark:border-indigo-500/15">
                    <span className="text-base shrink-0">{slot.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase">{slot.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{meal.meal}</p>
                    </div>
                    <button
                      onClick={async () => { await handleSelectMeal(slot.key, meal); onRemoveSuggested?.(slot.label); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shrink-0"
                    >
                      + Today
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Meal cards */}
        {planLoading ? (
          <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-indigo-400 text-2xl" /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {SLOTS.map(({ key, label, emoji, grad, border }) => {
              const meal = dayPlan[key];
              return meal ? (
                /* Filled card */
                <div key={key} className={`bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-100 dark:border-white/8 border-l-4 ${border} p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-lg shrink-0 shadow-lg`}>
                        {emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-slate-500 uppercase">{label}</p>
                        <p className="text-base font-black text-gray-900 dark:text-white leading-snug truncate">{meal.meal}</p>
                        {meal.description && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{meal.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleRemoveMeal(key)}
                        className="p-2 rounded-xl text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                        <FaTrash size={11} />
                      </button>
                      <button onClick={() => setActiveModal(key)}
                        className="p-2 rounded-xl text-gray-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition">
                        <FaExchangeAlt size={12} />
                      </button>
                    </div>
                  </div>
                  <MacroBar macros={meal.macros} />
                  <MacroPills macros={meal.macros} />
                </div>
              ) : (
                /* Empty card */
                <button key={key} onClick={() => setActiveModal(key)}
                  className="group w-full text-left rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 p-5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} opacity-25 group-hover:opacity-50 flex items-center justify-center text-lg shrink-0 transition-all`}>
                      {emoji}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-gray-300 dark:text-slate-700 uppercase">{label}</p>
                      <p className="text-sm font-semibold text-gray-300 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">Add {label.toLowerCase()} →</p>
                    </div>
                    <div className="ml-auto w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/15 flex items-center justify-center transition-all">
                      <FaPlus size={11} className="text-gray-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Daily totals */}
        {mealsLogged > 0 && (
          <div className="mt-6 bg-white dark:bg-[#0e0e1a] rounded-2xl border border-gray-100 dark:border-white/8 p-5">
            <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-slate-500 uppercase mb-4">Daily Total</p>
            <div className="grid grid-cols-4 gap-2 text-center mb-1">
              {[
                { label: 'Protein',  val: totals.protein,  unit: 'g',    color: 'text-violet-600 dark:text-violet-400' },
                { label: 'Carbs',    val: totals.carbs,    unit: 'g',    color: 'text-amber-600 dark:text-amber-400'   },
                { label: 'Fat',      val: totals.fats,     unit: 'g',    color: 'text-emerald-600 dark:text-emerald-400'},
                { label: 'Calories', val: totals.calories, unit: 'kcal', color: 'text-slate-600 dark:text-slate-300'   },
              ].map(({ label, val, unit, color }) => (
                <div key={label} className="bg-gray-50 dark:bg-white/3 rounded-xl py-3">
                  <p className={`text-xl font-black tabular-nums ${color}`}>{Math.round(val)}</p>
                  <p className="text-[9px] font-bold text-gray-400 dark:text-slate-600 uppercase mt-0.5">{unit} {label}</p>
                </div>
              ))}
            </div>
            <MacroBar macros={totals} />
          </div>
        )}

      </div>

      {activeModal && (
        <MealPickerModal
          slot={activeModal}
          onClose={() => setActiveModal(null)}
          onSelect={meal => handleSelectMeal(activeModal, meal)}
        />
      )}
    </div>
  );
}
