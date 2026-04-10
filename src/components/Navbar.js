import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const NAV_ITEMS = [
  { key: 'landing',  label: 'Home' },
  { key: 'main',     label: 'Meal Suggestions' },
  { key: 'fastfood', label: 'Fast Food' },
  { key: 'favorites',label: 'Favorites' },
  { key: 'mealplan', label: 'Meal Plan' },
];

export default function Navbar({ page, setPage, user, logout }) {
  const [open, setOpen] = useState(false);

  const navigate = (key) => {
    setPage(key);
    setOpen(false);
  };

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => navigate(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              page === key
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg md:hidden z-50">
          <div className="flex flex-col px-4 py-3 gap-1">
            {NAV_ITEMS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => navigate(key)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  page === key
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">{user?.name}</span>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
