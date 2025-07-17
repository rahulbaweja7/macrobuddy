import React from 'react';

export default function MealCard({ meal, expanded, onExpand, isFavorite, onSave, onRemove, showSave, showRemove }) {
  // Defensive: fallback for missing meal or macros
  if (!meal) {
    return <div className="bg-white rounded-2xl shadow-lg p-7 border border-gray-200">No meal data available.</div>;
  }
  const macros = meal.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 };
  return (
    <div className="bg-white rounded-2xl shadow-lg p-7 border border-gray-200 hover:shadow-xl transition-transform duration-200 group cursor-pointer" onClick={onExpand}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
          {meal.meal || 'Untitled Meal'}
          {isFavorite && <span className="text-yellow-500 text-sm">★</span>}
        </h3>
        <div className="flex items-center gap-2">
          {showSave && (
            <button
              onClick={e => { e.stopPropagation(); onSave && onSave(meal); }}
              className={`save-button px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${isFavorite ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {isFavorite ? '★ Saved' : '☆ Save'}
            </button>
          )}
          {showRemove && (
            <button
              onClick={e => { e.stopPropagation(); onRemove && onRemove(meal.id); }}
              className="px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 text-sm font-semibold transition-all duration-200"
            >
              Remove
            </button>
          )}
          <span className="text-xs text-indigo-600 font-semibold">{expanded ? 'Hide Details' : 'Show Details'}</span>
        </div>
      </div>
      <p className="text-gray-700 mb-2 italic text-base">{meal.description || 'No description available.'}</p>
      <div className="flex flex-wrap gap-3 text-base font-medium text-gray-800 mb-2">
        <span className="bg-indigo-50 border border-indigo-200 rounded px-3 py-1">Protein: {macros.protein}g</span>
        <span className="bg-orange-50 border border-orange-200 rounded px-3 py-1">Carbs: {macros.carbs}g</span>
        <span className="bg-yellow-50 border border-yellow-200 rounded px-3 py-1">Fats: {macros.fats}g</span>
        <span className="bg-gray-50 border border-gray-200 rounded px-3 py-1">Calories: {macros.calories}</span>
      </div>
      {meal.difference && (
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
          <span className="bg-yellow-100 rounded px-2 py-1">Δ Protein: {meal.difference.protein}</span>
          <span className="bg-yellow-100 rounded px-2 py-1">Δ Carbs: {meal.difference.carbs}</span>
          <span className="bg-yellow-100 rounded px-2 py-1">Δ Fats: {meal.difference.fats}</span>
          <span className="bg-yellow-100 rounded px-2 py-1">Δ Calories: {meal.difference.calories}</span>
        </div>
      )}
      {expanded && Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
        <div className="mt-4 animate-fade-in">
          <h4 className="font-semibold text-gray-700 mb-2">Detailed Recipe & Nutrition Table</h4>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-left font-bold">Ingredient</th>
                  <th className="px-3 py-2 text-left font-bold">State</th>
                  <th className="px-3 py-2 text-left font-bold">Quantity</th>
                  <th className="px-3 py-2 text-left font-bold">Protein (g)</th>
                  <th className="px-3 py-2 text-left font-bold">Carbs (g)</th>
                  <th className="px-3 py-2 text-left font-bold">Fats (g)</th>
                  <th className="px-3 py-2 text-left font-bold">Calories</th>
                </tr>
              </thead>
              <tbody>
                {meal.ingredients.map((ing, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{ing.name}</td>
                    <td className="px-3 py-2">{ing.state}</td>
                    <td className="px-3 py-2">{ing.quantity}</td>
                    <td className="px-3 py-2">{ing.protein}</td>
                    <td className="px-3 py-2">{ing.carbs}</td>
                    <td className="px-3 py-2">{ing.fats}</td>
                    <td className="px-3 py-2">{ing.calories}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {Array.isArray(meal.instructions) && meal.instructions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Step-by-Step Instructions</h4>
              <ol className="list-decimal list-inside text-gray-700 text-base space-y-1">
                {meal.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
      {meal.savedAt && (
        <div className="text-xs text-gray-500 mt-2">Saved on {new Date(meal.savedAt).toLocaleDateString()}</div>
      )}
    </div>
  );
} 