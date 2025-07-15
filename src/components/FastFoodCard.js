import React from 'react';

export default function FastFoodCard({ meal, isFavorite, onSave, onRemove }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-7 border border-gray-200 hover:shadow-xl transition-transform duration-200 group">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
          {meal.meal}
          {isFavorite && <span className="text-yellow-500 text-sm">★</span>}
        </h3>
        <button
          onClick={() => {
            if (isFavorite) {
              onRemove && onRemove(meal.id);
            } else {
              onSave && onSave(meal);
            }
          }}
          className={`save-button px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
            isFavorite ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isFavorite ? '★ Saved' : '☆ Save'}
        </button>
      </div>
      <p className="text-gray-700 mb-2 italic text-base">{meal.description}</p>
      <div className="flex flex-wrap gap-3 text-base font-medium text-gray-800 mb-2">
        <span className="bg-indigo-50 border border-indigo-200 rounded px-3 py-1">Protein: {meal.macros.protein}g</span>
        <span className="bg-orange-50 border border-orange-200 rounded px-3 py-1">Carbs: {meal.macros.carbs}g</span>
        <span className="bg-yellow-50 border border-yellow-200 rounded px-3 py-1">Fats: {meal.macros.fats}g</span>
        <span className="bg-gray-50 border border-gray-200 rounded px-3 py-1">Calories: {meal.macros.calories}</span>
      </div>
      {meal.difference && (
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
          <span className="bg-yellow-100 rounded px-2 py-1">Δ Protein: {meal.difference.protein}</span>
          <span className="bg-yellow-100 rounded px-2 py-1">Δ Carbs: {meal.difference.carbs}</span>
          <span className="bg-yellow-100 rounded px-2 py-1">Δ Fats: {meal.difference.fats}</span>
          <span className="bg-yellow-100 rounded px-2 py-1">Δ Calories: {meal.difference.calories}</span>
        </div>
      )}
      {meal.customization && (
        <div className="mt-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <span className="font-semibold">Suggested Customization:</span> {meal.customization}
        </div>
      )}
    </div>
  );
} 