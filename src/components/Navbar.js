import React, { useState } from 'react';
import { FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { key: 'landing',   label: 'Home' },
  { key: 'main',      label: 'Meal Suggestions' },
  { key: 'fastfood',  label: 'Fast Food' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'mealplan',  label: 'Meal Plan' },
];

export default function Navbar({ page, setPage, user, logout }) {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();

  const navigate = (key) => {
    setPage(key);
    setOpen(false);
  };

  return (
    <>
      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => navigate(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              page === key
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? <FaSun size={15} /> : <FaMoon size={15} />}
      </button>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#0a0a14] border-t border-gray-100 dark:border-white/5 shadow-lg dark:shadow-none md:hidden z-50">
          <div className="flex flex-col px-4 py-3 gap-1">
            {NAV_ITEMS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => navigate(key)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  page === key
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-white/5 mt-2 pt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">{user?.name}</span>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10 font-medium transition"
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
