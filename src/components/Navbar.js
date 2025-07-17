import React from 'react';

export default function Navbar({ page, setPage }) {
  return (
    <nav className="flex gap-8 text-gray-600 font-medium text-base">
      <button onClick={() => setPage('landing')} className={`hover:text-indigo-600 transition ${page === 'landing' ? 'text-indigo-600 font-bold' : ''}`}>Home</button>
      <button onClick={() => setPage('main')} className={`hover:text-indigo-600 transition ${page === 'main' ? 'text-indigo-600 font-bold' : ''}`}>Meal Suggestions</button>
      <button onClick={() => setPage('fastfood')} className={`hover:text-indigo-600 transition ${page === 'fastfood' ? 'text-indigo-600 font-bold' : ''}`}>Fast Food Alternative</button>
      <button onClick={() => setPage('favorites')} className={`hover:text-indigo-600 transition ${page === 'favorites' ? 'text-indigo-600 font-bold' : ''}`}>Favorites</button>
      <button onClick={() => setPage('mealplan')} className={`hover:text-indigo-600 transition ${page === 'mealplan' ? 'text-indigo-600 font-bold' : ''}`}>Meal Plan</button>
    </nav>
  );
} 