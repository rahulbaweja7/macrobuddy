import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './utils/api';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import HomePage from './pages/HomePage';
import MealSuggestionsPage from './pages/MealSuggestionsPage';
import FastFoodPage from './pages/FastFoodPage';
import FavoritesPage from './pages/FavoritesPage';
import MealPlanPage from './pages/MealPlanPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const FAST_FOOD_CHAINS = [
  "McDonald's", 'Burger King', "Wendy's", 'Taco Bell', 'KFC', 'Subway',
  'Chipotle', 'Panda Express', 'Chick-fil-A', 'Sonic', 'Jack in the Box',
  'Popeyes', "Arby's", 'Dairy Queen', 'Five Guys', "Culver's",
  'In-N-Out Burger', 'Shake Shack', 'Panera Bread', "Jimmy John's",
  'Little Caesars', "Domino's", 'Pizza Hut', "Papa John's", "Raising Cane's",
  "Jersey Mike's", 'El Pollo Loco', 'Qdoba', 'Del Taco', "Carl's Jr.",
  "Hardee's", 'Checkers', "Church's Chicken", 'Wingstop', 'Bojangles',
  'White Castle', "Zaxby's", 'Boston Market', 'A&W', 'Blaze Pizza',
  'Firehouse Subs', "Freddy's", 'Krystal', "Moe's Southwest Grill",
  'Noodles & Company', "Schlotzsky's", 'Steak & Shake', 'Whataburger',
];

const CUISINES = [
  'Any', 'American', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese',
  'Thai', 'Mediterranean', 'French', 'Greek', 'Middle Eastern', 'Korean',
  'Vietnamese', 'Spanish', 'African',
];

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [authPage, setAuthPage] = useState('login');
  const [page, setPage] = useState('landing');

  // Meal suggestions state
  const [macros, setMacros] = useState({ protein: '', carbs: '', fats: '', calories: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [loading2, setLoading2] = useState(false);
  const [error, setError] = useState('');
  const [cuisine, setCuisine] = useState('Any');
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Fast food state
  const [ffMacros, setFFMacros] = useState({ protein: '', carbs: '', fats: '', calories: '' });
  const [selectedChain, setSelectedChain] = useState(FAST_FOOD_CHAINS[0]);
  const [ffResults, setFFResults] = useState([]);
  const [ffLoading, setFFLoading] = useState(false);
  const [ffError, setFFError] = useState('');

  // Favorites state
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState('');
  const [favoriteSuggestions, setFavoriteSuggestions] = useState([]);
  const [favoriteSuggestionsLoading, setFavoriteSuggestionsLoading] = useState(false);
  const [expandedFavoriteId, setExpandedFavoriteId] = useState(null);
  const [expandedFavoriteSuggestionIndex, setExpandedFavoriteSuggestionIndex] = useState(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // ── Meal suggestion handlers ──────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMacros(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading2(true);
    setError('');
    try {
      const res = await api.post('/api/suggest-meals', {
        macros,
        preferences: `healthy, balanced meals${cuisine && cuisine !== 'Any' ? ', cuisine: ' + cuisine : ''}`,
      });
      if (res.data.suggestions?.length > 0) {
        setSuggestions(res.data.suggestions);
      } else {
        setError('No meal suggestions found. Try adjusting your macros or preferences.');
      }
    } catch {
      setError('Failed to get meal suggestions. Please try again.');
    } finally {
      setLoading2(false);
    }
  };

  const isFavorite = (mealName) => favorites.some(f => f.meal === mealName);
  const getFavoriteId = (mealName) => favorites.find(f => f.meal === mealName)?.id || null;

  const saveFavorite = async (meal) => {
    try {
      const res = await api.post('/api/favorites/save', { meal });
      setFavorites(prev => [...prev, res.data.meal]);
      showNotification('Meal saved to favorites!');
    } catch {
      showNotification('Failed to save meal', 'error');
    }
  };

  const removeFavorite = async (id) => {
    try {
      await api.delete(`/api/favorites/${id}`);
      setFavorites(prev => prev.filter(f => f.id !== id && f._id !== id));
      showNotification('Meal removed from favorites');
    } catch {
      showNotification('Failed to remove meal', 'error');
    }
  };

  // ── Fast food handlers ────────────────────────────────────────────────────
  const handleFFInputChange = (e) => {
    const { name, value } = e.target;
    setFFMacros(prev => ({ ...prev, [name]: value }));
  };

  const handleFFSubmit = async (e) => {
    if (e) e.preventDefault();
    setFFLoading(true);
    setFFError('');
    setFFResults([]);
    try {
      const res = await api.post('/api/fastfood-alternatives', { chain: selectedChain, macros: ffMacros });
      setFFResults(res.data.suggestions);
    } catch {
      setFFError('Failed to get fast food alternatives. Please try again.');
    } finally {
      setFFLoading(false);
    }
  };

  // ── Favorites handlers ────────────────────────────────────────────────────
  const loadFavorites = async () => {
    setFavoritesLoading(true);
    setFavoritesError('');
    try {
      const res = await api.get('/api/favorites');
      setFavorites(res.data.favorites);
    } catch {
      setFavoritesError('Failed to load favorites. Please try again.');
    } finally {
      setFavoritesLoading(false);
    }
  };

  const generateFavoriteSuggestions = async () => {
    setFavoriteSuggestionsLoading(true);
    try {
      const res = await api.post('/api/favorites/suggest', {
        macros,
        preferences: `healthy, balanced meals${cuisine && cuisine !== 'Any' ? ', cuisine: ' + cuisine : ''}`,
      });
      setFavoriteSuggestions(res.data.suggestions);
    } catch {
      console.error('Error generating favorite suggestions');
    } finally {
      setFavoriteSuggestionsLoading(false);
    }
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (loading) return null;

  if (!user) {
    return authPage === 'login'
      ? <LoginPage onSwitchToRegister={() => setAuthPage('register')} />
      : <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />;
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col font-sans">
      <Notification {...notification} />
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="relative max-w-5xl mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2 shrink-0">
            <img src="https://img.icons8.com/color/96/salad.png" alt="MacroBuddy Logo" className="w-8 h-8" />
            <span className="text-xl font-extrabold text-gray-800 tracking-tight">MacroBuddy</span>
          </div>
          <div className="flex items-center gap-3">
            <Navbar page={page} setPage={setPage} user={user} logout={logout} />
            {/* Desktop user + sign out — hidden on mobile (in hamburger instead) */}
            <div className="hidden md:flex items-center gap-3 border-l pl-4 border-gray-200">
              <span className="text-sm text-gray-600 font-medium">{user.name}</span>
              <button
                onClick={logout}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {page === 'landing' && <HomePage setPage={setPage} />}
      {page === 'main' && (
        <MealSuggestionsPage
          macros={macros}
          setMacros={setMacros}
          cuisine={cuisine}
          setCuisine={setCuisine}
          suggestions={suggestions}
          loading={loading2}
          error={error}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          expandedIndex={expandedIndex}
          setExpandedIndex={setExpandedIndex}
          isFavorite={isFavorite}
          onSave={saveFavorite}
          onRemove={removeFavorite}
          getFavoriteId={getFavoriteId}
          CUISINES={CUISINES}
        />
      )}
      {page === 'fastfood' && (
        <FastFoodPage
          ffMacros={ffMacros}
          setFFMacros={setFFMacros}
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          ffResults={ffResults}
          ffLoading={ffLoading}
          ffError={ffError}
          onInputChange={handleFFInputChange}
          onSubmit={handleFFSubmit}
          isFavorite={isFavorite}
          onSave={saveFavorite}
          onRemove={removeFavorite}
          getFavoriteId={getFavoriteId}
          FAST_FOOD_CHAINS={FAST_FOOD_CHAINS}
        />
      )}
      {page === 'favorites' && (
        <FavoritesPage
          favorites={favorites}
          favoritesLoading={favoritesLoading}
          favoritesError={favoritesError}
          loadFavorites={loadFavorites}
          expandedFavoriteId={expandedFavoriteId}
          setExpandedFavoriteId={setExpandedFavoriteId}
          onRemove={removeFavorite}
          macros={macros}
          setMacros={setMacros}
          favoriteSuggestions={favoriteSuggestions}
          favoriteSuggestionsLoading={favoriteSuggestionsLoading}
          generateFavoriteSuggestions={generateFavoriteSuggestions}
          expandedFavoriteSuggestionIndex={expandedFavoriteSuggestionIndex}
          setExpandedFavoriteSuggestionIndex={setExpandedFavoriteSuggestionIndex}
          onSave={saveFavorite}
        />
      )}
      {page === 'mealplan' && <MealPlanPage />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
