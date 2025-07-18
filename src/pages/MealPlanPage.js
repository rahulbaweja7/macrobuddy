import React, { useState } from 'react';
import { FaEgg, FaUtensils, FaPizzaSlice } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = [
  { key: 'Breakfast', icon: <FaEgg className="inline mr-1 text-yellow-500" />, color: 'bg-yellow-50' },
  { key: 'Lunch', icon: <FaUtensils className="inline mr-1 text-green-500" />, color: 'bg-green-50' },
  { key: 'Dinner', icon: <FaPizzaSlice className="inline mr-1 text-indigo-500" />, color: 'bg-indigo-50' },
];

export default function MealPlanPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlan, setMealPlan] = useState(() => {
    const plan = {};
    DAYS.forEach(day => {
      plan[day] = {};
      MEALS.forEach(meal => {
        plan[day][meal.key] = null;
      });
    });
    return plan;
  });

  // Placeholder: will connect to meal suggestion logic later
  const handleGenerate = (day, mealKey) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealKey]: { meal: `${mealKey} for ${day}`, description: 'Sample meal', macros: { protein: 20, carbs: 30, fats: 10, calories: 300 } }
      }
    }));
  };

  // Calculate daily macro summary
  const getDayMacros = (day) => {
    const totals = { protein: 0, carbs: 0, fats: 0, calories: 0 };
    MEALS.forEach(({ key }) => {
      const m = mealPlan[day][key];
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
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Weekly Meal Plan</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6">Plan your week with personalized meals for each day and meal slot.</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {DAYS.map(day => {
          const macros = getDayMacros(day);
          return (
            <div key={day} className="rounded-3xl shadow-xl bg-white border border-gray-100 p-6 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-indigo-700">{day}</h2>
                <span className="text-xs text-gray-400 font-semibold">{Object.values(mealPlan[day]).filter(Boolean).length}/3 meals</span>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                {MEALS.map(({ key, icon, color }) => (
                  <div key={key} className={`rounded-xl p-3 flex items-center gap-3 shadow-sm ${color} transition-all duration-200`}> 
                    <span className="text-xl">{icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{key}</div>
                      {mealPlan[day][key] ? (
                        <>
                          <div className="text-xs text-gray-600">{mealPlan[day][key].description}</div>
                          <div className="text-xs mt-1 text-gray-700">P: {mealPlan[day][key].macros.protein}g, C: {mealPlan[day][key].macros.carbs}g, F: {mealPlan[day][key].macros.fats}g, Cal: {mealPlan[day][key].macros.calories}</div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-400 italic">No meal selected</div>
                      )}
                    </div>
                    <button
                      className="ml-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700 transition"
                      onClick={() => handleGenerate(day, key)}
                    >
                      {mealPlan[day][key] ? 'Edit' : 'Generate'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-semibold">Daily Total</div>
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="bg-indigo-100 text-indigo-700 rounded px-2 py-1">P: {macros.protein}g</span>
                  <span className="bg-orange-100 text-orange-700 rounded px-2 py-1">C: {macros.carbs}g</span>
                  <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1">F: {macros.fats}g</span>
                  <span className="bg-gray-100 text-gray-700 rounded px-2 py-1">Cal: {macros.calories}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
} 