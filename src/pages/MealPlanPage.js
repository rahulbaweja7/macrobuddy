import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaEgg, FaUtensils, FaPizzaSlice } from 'react-icons/fa';

const MEALS = [
  { key: 'Breakfast', icon: <FaEgg className="inline mr-1 text-yellow-500" />, color: 'bg-yellow-50' },
  { key: 'Lunch', icon: <FaUtensils className="inline mr-1 text-green-500" />, color: 'bg-green-50' },
  { key: 'Dinner', icon: <FaPizzaSlice className="inline mr-1 text-indigo-500" />, color: 'bg-indigo-50' },
];

function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export default function MealPlanPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState({}); // { 'YYYY-MM-DD': { Breakfast: {...}, ... } }

  const dateKey = formatDate(selectedDate);
  const dayPlan = mealPlans[dateKey] || {};

  // Placeholder: will connect to meal suggestion logic later
  const handleAddMeal = (mealKey) => {
    setMealPlans(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealKey]: {
          meal: `${mealKey} for ${dateKey}`,
          description: 'Sample meal',
          macros: { protein: 20, carbs: 30, fats: 10, calories: 300 }
        }
      }
    }));
  };

  // Calculate daily macro summary
  const getDayMacros = () => {
    const totals = { protein: 0, carbs: 0, fats: 0, calories: 0 };
    MEALS.forEach(({ key }) => {
      const m = dayPlan[key];
      if (m && m.macros) {
        totals.protein += m.macros.protein || 0;
        totals.carbs += m.macros.carbs || 0;
        totals.fats += m.macros.fats || 0;
        totals.calories += m.macros.calories || 0;
      }
    });
    return totals;
  };

  return (
    <section className="flex-1 flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-indigo-50 to-white min-h-screen">
      <div className="max-w-5xl w-full mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Meal Plan</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6">Select a date and plan your meals for that day.</p>
        <div className="flex justify-center mt-8">
          <div className="rounded-2xl shadow-lg p-4 bg-white border border-gray-100">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={({ date, view }) =>
                view === 'month' && date.toDateString() === selectedDate.toDateString()
                  ? 'bg-indigo-600 text-white rounded-full' : ''
              }
              prev2Label={null}
              next2Label={null}
              className="modern-calendar"
            />
          </div>
        </div>
      </div>
      <div className="w-full max-w-xl mx-auto mt-8">
        <div className="rounded-3xl shadow-xl bg-white border border-gray-100 p-6 flex flex-col transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-indigo-700">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
            <span className="text-xs text-gray-400 font-semibold">{Object.values(dayPlan).filter(Boolean).length}/3 meals</span>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {MEALS.map(({ key, icon, color }) => (
              <div key={key} className={`rounded-xl p-3 flex items-center gap-3 shadow-sm ${color} transition-all duration-200`}> 
                <span className="text-xl">{icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{key}</div>
                  {dayPlan[key] ? (
                    <>
                      <div className="text-xs text-gray-600">{dayPlan[key].description}</div>
                      <div className="text-xs mt-1 text-gray-700">P: {dayPlan[key].macros.protein}g, C: {dayPlan[key].macros.carbs}g, F: {dayPlan[key].macros.fats}g, Cal: {dayPlan[key].macros.calories}</div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400 italic flex items-center gap-2">No meal selected
                      <button
                        className="ml-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700 transition"
                        onClick={() => handleAddMeal(key)}
                      >
                        Add Meal
                      </button>
                    </div>
                  )}
                </div>
                {dayPlan[key] && (
                  <button
                    className="ml-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700 transition"
                    onClick={() => handleAddMeal(key)}
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1 font-semibold">Daily Total</div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="bg-indigo-100 text-indigo-700 rounded px-2 py-1">P: {getDayMacros().protein}g</span>
              <span className="bg-orange-100 text-orange-700 rounded px-2 py-1">C: {getDayMacros().carbs}g</span>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1">F: {getDayMacros().fats}g</span>
              <span className="bg-gray-100 text-gray-700 rounded px-2 py-1">Cal: {getDayMacros().calories}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 