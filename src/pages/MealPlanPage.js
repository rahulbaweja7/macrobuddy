import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaEgg, FaUtensils, FaPizzaSlice, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';

const SLOTS = [
  { key: 'breakfast', label: 'Breakfast', icon: <FaEgg className="text-yellow-500" />, color: 'bg-yellow-50 border-yellow-100' },
  { key: 'lunch',     label: 'Lunch',     icon: <FaUtensils className="text-green-500" />, color: 'bg-green-50 border-green-100' },
  { key: 'dinner',    label: 'Dinner',    icon: <FaPizzaSlice className="text-indigo-500" />, color: 'bg-indigo-50 border-indigo-100' },
];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function MacroBadges({ macros }) {
  if (!macros) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      <span className="text-xs bg-indigo-100 text-indigo-700 rounded px-2 py-0.5">P: {macros.protein}g</span>
      <span className="text-xs bg-orange-100 text-orange-700 rounded px-2 py-0.5">C: {macros.carbs}g</span>
      <span className="text-xs bg-yellow-100 text-yellow-700 rounded px-2 py-0.5">F: {macros.fats}g</span>
      <span className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{macros.calories} cal</span>
    </div>
  );
}

// ── Meal picker modal ──────────────────────────────────────────────────────────
function MealPickerModal({ slot, onClose, onSelect }) {
  const [tab, setTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(true);

  // Suggest tab state
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 capitalize">Add {slot}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {['favorites', 'generate'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition capitalize ${
                tab === t
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'favorites' ? 'Pick from Favorites' : 'Generate New'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 max-h-96 overflow-y-auto">
          {tab === 'favorites' && (
            favLoading ? (
              <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-indigo-400 text-2xl" /></div>
            ) : favorites.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No favorites saved yet. Generate a meal first!</p>
            ) : (
              <div className="flex flex-col gap-3">
                {favorites.map(fav => (
                  <button
                    key={fav._id || fav.id}
                    onClick={() => onSelect(fav)}
                    className="text-left p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  >
                    <div className="font-semibold text-gray-800 text-sm">{fav.meal}</div>
                    {fav.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{fav.description}</div>}
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
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field} {field !== 'calories' ? '(g)' : '(kcal)'}</label>
                    <input
                      type="number"
                      value={macros[field]}
                      onChange={e => setMacros(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              {suggestError && <p className="text-xs text-red-500">{suggestError}</p>}
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
                      className="text-left p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition"
                    >
                      <div className="font-semibold text-gray-800 text-sm">{s.meal}</div>
                      {s.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.description}</div>}
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

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MealPlanPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayPlan, setDayPlan] = useState({ breakfast: null, lunch: null, dinner: null });
  const [planLoading, setPlanLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'breakfast' | 'lunch' | 'dinner' | null

  const dateKey = formatDate(selectedDate);

  const fetchPlan = useCallback(async (date) => {
    setPlanLoading(true);
    try {
      const res = await api.get(`/api/mealplan?date=${date}`);
      setDayPlan({
        breakfast: res.data.plan?.breakfast || null,
        lunch: res.data.plan?.lunch || null,
        dinner: res.data.plan?.dinner || null,
      });
    } catch {
      setDayPlan({ breakfast: null, lunch: null, dinner: null });
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

  return (
    <section className="flex-1 flex flex-col items-center py-12 px-4 bg-gradient-to-br from-indigo-50 to-white min-h-screen">
      <div className="max-w-5xl w-full mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Meal Plan</h1>
        <p className="text-lg text-gray-600">Select a date and plan your meals for that day.</p>
        <div className="flex justify-center mt-8">
          <div className="rounded-2xl shadow-lg p-4 bg-white border border-gray-100">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              prev2Label={null}
              next2Label={null}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto">
        <div className="rounded-3xl shadow-xl bg-white border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-indigo-700">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded-full">
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
                    <div className="font-semibold text-gray-800 text-sm">{label}</div>
                    {dayPlan[key] ? (
                      <>
                        <div className="text-sm text-gray-700 font-medium mt-0.5">{dayPlan[key].meal}</div>
                        {dayPlan[key].description && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{dayPlan[key].description}</div>
                        )}
                        <MacroBadges macros={dayPlan[key].macros} />
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic mt-0.5">No meal selected</div>
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
                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold hover:bg-gray-200 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Daily totals */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 font-semibold mb-2">Daily Total</div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-indigo-100 text-indigo-700 rounded px-2 py-1 font-medium">P: {dailyTotals.protein}g</span>
              <span className="text-xs bg-orange-100 text-orange-700 rounded px-2 py-1 font-medium">C: {dailyTotals.carbs}g</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 rounded px-2 py-1 font-medium">F: {dailyTotals.fats}g</span>
              <span className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 font-medium">{dailyTotals.calories} cal</span>
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
