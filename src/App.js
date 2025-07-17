import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import MealCard from './components/MealCard';
import FavoritesList from './components/FavoritesList';
import HomePage from './pages/HomePage';
import MealSuggestionsPage from './pages/MealSuggestionsPage';
import FastFoodPage from './pages/FastFoodPage';
import FavoritesPage from './pages/FavoritesPage';
import MealPlanPage from './pages/MealPlanPage';
// import other pages as you create them

const FAST_FOOD_CHAINS = [
  "McDonald's", 'Burger King', "Wendy's", 'Taco Bell', 'KFC', 'Subway', 'Chipotle', 'Panda Express', 'Chick-fil-A', 'Sonic', 'Jack in the Box', 'Popeyes', "Arby's", 'Dairy Queen', 'Five Guys', "Culver's", 'In-N-Out Burger', 'Shake Shack', 'Panera Bread', "Jimmy John's", 'Little Caesars', "Domino's", 'Pizza Hut', "Papa John's", "Raising Cane's", "Jersey Mike's", 'El Pollo Loco', 'Qdoba', 'Del Taco', "Carl's Jr.", "Hardee's", 'Checkers', "Church's Chicken", 'Wingstop', 'Bojangles', 'White Castle', "Zaxby's", 'Boston Market', 'A&W', 'Blaze Pizza', 'Firehouse Subs', "Freddy's", 'Krystal', "Moe's Southwest Grill", 'Noodles & Company', "Schlotzsky's", 'Steak & Shake', 'Whataburger',
];
const CUISINES = [
  'Any', 'American', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'Mediterranean', 'French', 'Greek', 'Middle Eastern', 'Korean', 'Vietnamese', 'Spanish', 'African',
];

function App() {
  const [page, setPage] = useState('landing');
  // Global state
  const [macros, setMacros] = useState({ protein: '', carbs: '', fats: '', calories: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cuisine, setCuisine] = useState('Any');
  const [ffMacros, setFFMacros] = useState({ protein: '', carbs: '', fats: '', calories: '' });
  const [selectedChain, setSelectedChain] = useState(FAST_FOOD_CHAINS[0]);
  const [ffResults, setFFResults] = useState([]);
  const [ffLoading, setFFLoading] = useState(false);
  const [ffError, setFFError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState('');
  const [favoriteSuggestions, setFavoriteSuggestions] = useState([]);
  const [favoriteSuggestionsLoading, setFavoriteSuggestionsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [expandedFavoriteId, setExpandedFavoriteId] = useState(null);
  const [expandedFavoriteSuggestionIndex, setExpandedFavoriteSuggestionIndex] = useState(null);

  // Handlers for meal suggestions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMacros(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3001/api/suggest-meals', {
        macros,
        preferences: `healthy, balanced meals${cuisine && cuisine !== 'Any' ? ', cuisine: ' + cuisine : ''}`
      });
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setSuggestions(response.data.suggestions);
      } else {
        setError('No meal suggestions found. Try adjusting your macros or preferences.');
      }
    } catch (err) {
      setError('Failed to get meal suggestions. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  const isFavorite = (mealName) => {
    return favorites.some(fav => fav.meal === mealName);
  };
  const saveFavorite = async (meal) => {
    try {
      const response = await axios.post('http://localhost:3001/api/favorites/save', { meal });
      setFavorites(prev => [...prev, response.data.meal]);
      setNotification({ show: true, message: 'Meal saved to favorites!', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (err) {
      console.error('Error saving favorite:', err);
      setNotification({ show: true, message: 'Failed to save meal', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    }
  };
  const removeFavorite = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/favorites/${id}`);
      setFavorites(prev => prev.filter(meal => meal.id !== id));
      setNotification({ show: true, message: 'Meal removed from favorites', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (err) {
      console.error('Error removing favorite:', err);
      setNotification({ show: true, message: 'Failed to remove meal', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    }
  };
  const getFavoriteId = (mealName) => {
    const favorite = favorites.find(fav => fav.meal === mealName);
    return favorite ? favorite.id : null;
  };

  // Handlers for fast food
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
      const response = await axios.post('http://localhost:3001/api/fastfood-alternatives', {
        chain: selectedChain,
        macros: ffMacros
      });
      setFFResults(response.data.suggestions);
    } catch (err) {
      setFFError('Failed to get fast food alternatives. Please try again.');
      console.error('Error:', err);
    } finally {
      setFFLoading(false);
    }
  };

  // Handlers for favorites
  const loadFavorites = async () => {
    setFavoritesLoading(true);
    setFavoritesError('');
    try {
      const response = await axios.get('http://localhost:3001/api/favorites');
      setFavorites(response.data.favorites);
    } catch (err) {
      setFavoritesError('Failed to load favorites. Please try again.');
      console.error('Error:', err);
    } finally {
      setFavoritesLoading(false);
    }
  };
  const generateFavoriteSuggestions = async () => {
    setFavoriteSuggestionsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/favorites/suggest', {
        macros,
        preferences: `healthy, balanced meals${cuisine && cuisine !== 'Any' ? ', cuisine: ' + cuisine : ''}`
      });
      setFavoriteSuggestions(response.data.suggestions);
    } catch (err) {
      console.error('Error generating favorite suggestions:', err);
    } finally {
      setFavoriteSuggestionsLoading(false);
    }
  };

  // Example: Render HomePage for landing, pass setPage for navigation
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col font-sans">
      <Notification {...notification} />
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2">
            <img src="https://img.icons8.com/color/96/salad.png" alt="MacroBuddy Logo" className="w-8 h-8" />
            <span className="text-2xl font-extrabold text-gray-800 tracking-tight">MacroBuddy</span>
          </div>
          <Navbar page={page} setPage={setPage} />
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
          loading={loading}
          error={error}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          expandedIndex={expandedIndex}
          setExpandedIndex={setExpandedIndex}
          isFavorite={isFavorite}
          onSave={saveFavorite}
          onRemove={removeFavorite}
          getFavoriteId={getFavoriteId}
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
      {page === 'mealplan' && (
        <MealPlanPage />
      )}
    </div>
  );
}

export default App;
