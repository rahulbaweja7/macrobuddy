import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaEgg, FaUtensils, FaPizzaSlice, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';

import { FaBolt } from 'react-icons/fa';

const SLOTS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', icon: <FaEgg className="text-yellow-500" />, color: 'bg-yellow-50 dark:bg-yellow-500/5 border-yellow-100 dark:border-yellow-500/15' },
  { key: 'lunch',     label: 'Lunch',     emoji: '🥗', icon: <FaUtensils className="text-green-500" />, color: 'bg-green-50 dark:bg-green-500/5 border-green-100 dark:border-green-500/15' },
  { key: 'dinner',    label: 'Dinner',    emoji: '🍽️', icon: <FaPizzaSlice className="text-indigo-500" />, color: 'bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/15' },
  { key: 'snack',     label: 'Snack',     emoji: '🍎', icon: <span className="text-base">🍎</span>, color: 'bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/15' },
];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function MacroBadges({ macros }) {
  if (!macros) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      <span className="text-xs bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded px-2 py-0.5">P: {macros.protein}g</span>
      <span className="text-xs bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 rounded px-2 py-0.5">C: {macros.carbs}g</span>
      <span className="text-xs bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 rounded px-2 py-0.5">F: {macros.fats}g</span>
      <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-slate-300 rounded px-2 py-0.5">{macros.calories} cal</span>
    </div>
  );
}

function MealPickerModal({ slot, onClose, onSelect }) {
  const [tab, setTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(true);

  const [macros, setMacros] = useState({ protein: '', carbs: '', fats: '', calories: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');

  useEffect(() => {
    api.get('/api/favorites')
      .then(res => setFavorites(res.data.favorites))
      .catch(() => {})
      .finally(() => setFavLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!macros.protein || !macros.carbs || !macros.fats || !macros.calories) {
      setSuggestError('Fill in all macro fields.');
      return;
    }
    setSuggestError('');
    setSuggestLoading(true);
    try {
      const res = await api.post('/api/suggest-meals', {
        macros,
        preferences: 'healthy, balanced meals',
      });
      setSuggestions(res.data.suggestions || []);
    } catch {
      setSuggestError('Failed to generate suggestions. Try again.');
    } finally {
      setSuggestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#0e0e1a] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/8">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">Add {slot}</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white transition">
            <FaTimes />
          </button>
        </div>

        <div className="flex border-b border-gray-100 dark:border-white/8">
          {['favorites', 'generate'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition capitalize ${
                tab === t
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              {t === 'favorites' ? 'Pick from Favorites' : 'Generate New'}
            </button>
          ))}
        </div>

        <div className="p-5 max-h-96 overflow-y-auto">
          {tab === 'favorites' && (
            favLoading ? (
              <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-indigo-400 text-2xl" /></div>
            ) : favorites.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No favorites saved yet. Generate a meal first!</p>
            ) : (
              <div className="flex flex-col gap-3">
                {favorites.map(fav => (
                  <button
                    key={fav._id || fav.id}
                    onClick={() => onSelect(fav)}
                    className="text-left p-3 rounded-xl border border-gray-100 dark:border-white/8 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
                  >
                    <div className="font-semibold text-gray-800 dark:text-white text-sm">{fav.meal}</div>
                    {fav.description && <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{fav.description}</div>}
                    <MacroBadges macros={fav.macros} />
                  </button>
                ))}
              </div>
            )
          )}

          {tab === 'generate' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {['protein', 'carbs', 'fats', 'calories'].map(field => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1 capitalize">{field} {field !== 'calories' ? '(g)' : '(kcal)'}</label>
                    <input
                      type="number"
                      value={macros[field]}
                      onChange={e => setMacros(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              {suggestError && <p className="text-xs text-red-500 dark:text-red-400">{suggestError}</p>}
              <button
                onClick={handleGenerate}
                disabled={suggestLoading}
                className="py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {suggestLoading && <FaSpinner className="animate-spin" />}
                {suggestLoading ? 'Generating…' : 'Generate Suggestions'}
              </button>
              {suggestions.length > 0 && (
                <div className="flex flex-col gap-3 mt-1">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => onSelect(s)}
                      className="text-left p-3 rounded-xl border border-gray-100 dark:border-white/8 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
                    >
                      <div className="font-semibold text-gray-800 dark:text-white text-sm">{s.meal}</div>
                      {s.description && <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{s.description}</div>}
                      <MacroBadges macros={s.macros} />
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

export default function MealPlanPage({ suggestedDayPlan, onRemoveSuggested, onClearSuggested, setPage }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayPlan, setDayPlan] = useState({ breakfast: null, lunch: null, dinner: null, snack: null });
  const [planLoading, setPlanLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const dateKey = formatDate(selectedDate);

  const fetchPlan = useCallback(async (date) => {
    setPlanLoading(true);
    try {
      const res = await api.get(`/api/mealplan?date=${date}`);
      setDayPlan({
        breakfast: res.data.plan?.breakfast || null,
        lunch: res.data.plan?.lunch || null,
        dinner: res.data.plan?.dinner || null,
        snack: res.data.plan?.snack || null,
      });
    } catch {
      setDayPlan({ breakfast: null, lunch: null, dinner: null, snack: null });
    } finally {
      setPlanLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan(dateKey);
  }, [dateKey, fetchPlan]);

  const handleSelectMeal = async (slot, meal) => {
    setActiveModal(null);
    try {
      await api.post('/api/mealplan', { date: dateKey, slot, meal });
      setDayPlan(prev => ({ ...prev, [slot]: meal }));
    } catch {
      console.error('Failed to save meal to plan');
    }
    return true;
  };

  const handleRemoveMeal = async (slot) => {
    try {
      await api.delete(`/api/mealplan/${dateKey}/${slot}`);
      setDayPlan(prev => ({ ...prev, [slot]: null }));
    } catch {
      console.error('Failed to remove meal from plan');
    }
  };

  const dailyTotals = SLOTS.reduce((totals, { key }) => {
    const m = dayPlan[key]?.macros;
    if (m) {
      totals.protein += m.protein || 0;
      totals.carbs += m.carbs || 0;
      totals.fats += m.fats || 0;
      totals.calories += m.calories || 0;
    }
    return totals;
  }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

  const mealsLogged = SLOTS.filter(({ key }) => dayPlan[key]).length;


  const suggestedMeals = suggestedDayPlan
    ? SLOTS.filter(s => suggestedDayPlan[s.label])
    : [];

  const saveAllSuggested = async () => {
    const today = formatDate(new Date());
    for (const slot of suggestedMeals) {
      const meal = suggestedDayPlan[slot.label];
      if (meal) {
        try {
          await api.post('/api/mealplan', { date: today, slot: slot.key, meal });
        } catch {}
      }
    }
    if (formatDate(selectedDate) === today) fetchPlan(today);
    onClearSuggested?.();
  };

  return (
    <section className="flex-1 bg-white dark:bg-[#080810] py-10 px-4">
      <div className="max-w-3xl w-full mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Meal Planner</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Select a date and plan your meals.</p>

        {/* Suggestions quick-add strip */}
        {suggestedMeals.length > 0 && (
          <div className="mt-5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaBolt size={11} className="text-indigo-500" />
                <p className="text-xs font-bold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase">From Meal Suggestions</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage?.('main')}
                  className="text-xs font-semibold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
                >
                  Edit
                </button>
                <button
                  onClick={saveAllSuggested}
                  className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
                >
                  Save all to today
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {suggestedMeals.map(slot => {
                const meal = suggestedDayPlan[slot.label];
                return (
                  <div key={slot.key} className="flex items-center gap-3 bg-white dark:bg-[#0e0e1a] rounded-xl px-3 py-2.5 border border-indigo-100 dark:border-indigo-500/15">
                    <span className="text-lg">{slot.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">{slot.label}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{meal.meal}</p>
                      {meal.macros && (
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                          {meal.macros.protein}g P · {meal.macros.carbs}g C · {meal.macros.fats}g F · {meal.macros.calories} kcal
                        </p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        await handleSelectMeal(slot.key, meal);
                        onRemoveSuggested?.(slot.label);
                      }}
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

        <div className="flex justify-center mt-6">
          <div className="rounded-2xl shadow-lg dark:shadow-none p-4 bg-white dark:bg-[#0e0e1a] border border-gray-100 dark:border-white/8">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              prev2Label={null}
              next2Label={null}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <div className="rounded-3xl shadow-xl dark:shadow-none bg-white dark:bg-[#0e0e1a] border border-gray-100 dark:border-white/8 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-full">
              {mealsLogged}/3 meals
            </span>
          </div>

          {planLoading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-indigo-400 text-2xl" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {SLOTS.map(({ key, label, icon, color }) => (
                <div key={key} className={`rounded-xl p-4 border ${color} flex items-start gap-3`}>
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{label}</div>
                    {dayPlan[key] ? (
                      <>
                        <div className="text-sm text-gray-700 dark:text-slate-300 font-medium mt-0.5">{dayPlan[key].meal}</div>
                        {dayPlan[key].description && (
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{dayPlan[key].description}</div>
                        )}
                        <MacroBadges macros={dayPlan[key].macros} />
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 dark:text-slate-500 italic mt-0.5">No meal selected</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => setActiveModal(key)}
                      className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                    >
                      {dayPlan[key] ? 'Change' : 'Add'}
                    </button>
                    {dayPlan[key] && (
                      <button
                        onClick={() => handleRemoveMeal(key)}
                        className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="text-xs text-gray-500 dark:text-slate-400 font-semibold mb-2">Daily Total</div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded px-2 py-1 font-medium">P: {dailyTotals.protein}g</span>
              <span className="text-xs bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 rounded px-2 py-1 font-medium">C: {dailyTotals.carbs}g</span>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 rounded px-2 py-1 font-medium">F: {dailyTotals.fats}g</span>
              <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-slate-300 rounded px-2 py-1 font-medium">{dailyTotals.calories} cal</span>
            </div>
          </div>
        </div>
      </div>

      {activeModal && (
        <MealPickerModal
          slot={activeModal}
          onClose={() => setActiveModal(null)}
          onSelect={(meal) => handleSelectMeal(activeModal, meal)}
        />
      )}
    </section>
  );
}
