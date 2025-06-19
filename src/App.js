import React, { useState } from 'react';
import axios from 'axios';

const FAST_FOOD_CHAINS = [
  'McDonald\'s',
  'Burger King',
  'Wendy\'s',
  'Taco Bell',
  'KFC',
  'Subway',
  'Chipotle',
  'Panda Express',
  'Chick-fil-A',
  'Sonic',
  'Jack in the Box',
  'Popeyes',
  'Arby\'s',
  'Dairy Queen',
  'Five Guys',
  'Culver\'s',
  'In-N-Out Burger',
  'Shake Shack',
  'Panera Bread',
  'Jimmy John\'s',
  'Little Caesars',
  'Domino\'s',
  'Pizza Hut',
  'Papa John\'s',
  'Raising Cane\'s',
  'Jersey Mike\'s',
  'El Pollo Loco',
  'Qdoba',
  'Del Taco',
  'Carl\'s Jr.',
  'Hardee\'s',
  'Checkers',
  'Church\'s Chicken',
  'Wingstop',
  'Bojangles',
  'White Castle',
  'Zaxby\'s',
  'Boston Market',
  'A&W',
  'Blaze Pizza',
  'Firehouse Subs',
  'Freddy\'s',
  'Krystal',
  'Moe\'s Southwest Grill',
  'Noodles & Company',
  'Schlotzsky\'s',
  'Steak \u0026 Shake',
  'Whataburger',
];

const CUISINES = [
  'Any',
  'American',
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'Japanese',
  'Thai',
  'Mediterranean',
  'French',
  'Greek',
  'Middle Eastern',
  'Korean',
  'Vietnamese',
  'Spanish',
  'African',
];

function App() {
  const [page, setPage] = useState('landing');

  // Main meal suggestion state
  const [macros, setMacros] = useState({ protein: '', carbs: '', fats: '', calories: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fast food alternative state
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

  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Load favorites when navigating to favorites page
  React.useEffect(() => {
    if (page === 'favorites') {
      loadFavorites();
    }
  }, [page]);

  // Handlers for main page
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMacros(prev => ({ ...prev, [name]: value }));
  };
  const [cuisine, setCuisine] = useState('Any');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const response = await axios.post('http://localhost:3002/api/suggest-meals', {
        macros,
        preferences: `healthy, balanced meals${cuisine && cuisine !== 'Any' ? ', cuisine: ' + cuisine : ''}`
      });
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError('Failed to get meal suggestions. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for fast food page
  const handleFFInputChange = (e) => {
    const { name, value } = e.target;
    setFFMacros(prev => ({ ...prev, [name]: value }));
  };
  const handleFFSubmit = async (e) => {
    e.preventDefault();
    setFFLoading(true);
    setFFError('');
    setFFResults([]);
    try {
      const response = await axios.post('http://localhost:3002/api/fastfood-alternatives', {
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
      const response = await axios.get('http://localhost:3002/api/favorites');
      setFavorites(response.data.favorites);
    } catch (err) {
      setFavoritesError('Failed to load favorites. Please try again.');
      console.error('Error:', err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const saveFavorite = async (meal) => {
    try {
      const response = await axios.post('http://localhost:3002/api/favorites/save', { meal });
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
      await axios.delete(`http://localhost:3002/api/favorites/${id}`);
      setFavorites(prev => prev.filter(meal => meal.id !== id));
      setNotification({ show: true, message: 'Meal removed from favorites', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (err) {
      console.error('Error removing favorite:', err);
      setNotification({ show: true, message: 'Failed to remove meal', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    }
  };

  const generateFavoriteSuggestions = async () => {
    setFavoriteSuggestionsLoading(true);
    try {
      const response = await axios.post('http://localhost:3002/api/favorites/suggest', {
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

  const isFavorite = (mealName) => {
    return favorites.some(fav => fav.meal === mealName);
  };

  const getFavoriteId = (mealName) => {
    const favorite = favorites.find(fav => fav.meal === mealName);
    return favorite ? favorite.id : null;
  };

  const [expandedIndex, setExpandedIndex] = useState(null);

  // Add state for expanded favorite meals
  const [expandedFavoriteId, setExpandedFavoriteId] = useState(null);

  // Add state for expanded favorite suggestions
  const [expandedFavoriteSuggestionIndex, setExpandedFavoriteSuggestionIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col font-sans">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <span className="text-green-600">✓</span>
            ) : (
              <span className="text-red-600">✗</span>
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2">
            <img src="https://img.icons8.com/color/96/salad.png" alt="MacroBuddy Logo" className="w-8 h-8" />
            <span className="text-2xl font-extrabold text-gray-800 tracking-tight">MacroBuddy</span>
          </div>
          <nav className="flex gap-8 text-gray-600 font-medium text-base">
            <button onClick={() => setPage('landing')} className={`hover:text-indigo-600 transition ${page === 'landing' ? 'text-indigo-600 font-bold' : ''}`}>Home</button>
            <button onClick={() => setPage('main')} className={`hover:text-indigo-600 transition ${page === 'main' ? 'text-indigo-600 font-bold' : ''}`}>Meal Suggestions</button>
            <button onClick={() => setPage('fastfood')} className={`hover:text-indigo-600 transition ${page === 'fastfood' ? 'text-indigo-600 font-bold' : ''}`}>Fast Food Alternative</button>
            <button onClick={() => setPage('favorites')} className={`hover:text-indigo-600 transition ${page === 'favorites' ? 'text-indigo-600 font-bold' : ''}`}>Favorites</button>
          </nav>
        </div>
      </header>

      {/* Landing Page */}
      {page === 'landing' && (
        <section className="flex-1 flex flex-col items-center justify-center py-12 px-4">
          <div className="max-w-4xl w-full mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Your Personal Macro Nutrition Assistant
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Get personalized meal suggestions and fast food alternatives based on your macro requirements
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={() => setPage('main')}
                className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-200"
              >
                Get Meal Suggestions
              </button>
              <button 
                onClick={() => setPage('fastfood')}
                className="px-8 py-4 rounded-full bg-white text-indigo-600 font-bold text-lg shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 border-indigo-600"
              >
                Find Fast Food Alternatives
              </button>
            </div>
          </div>

          <div className="max-w-4xl w-full mx-auto grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/96/restaurant.png" alt="Meal Icon" className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Meal Suggestions</h3>
              <p className="text-gray-600">
                Get personalized meal suggestions based on your macro requirements. Choose your preferred cuisine and get detailed recipes with exact quantities and nutrition information.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/96/fast-food.png" alt="Fast Food Icon" className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast Food Alternatives</h3>
              <p className="text-gray-600">
                Find macro-friendly options at your favorite fast food chains. Get detailed nutrition information and make informed choices when eating out.
              </p>
            </div>
          </div>

          <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Your Macros</h3>
                <p className="text-gray-600">Specify your protein, carbs, fats, and calorie requirements</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Suggestions</h3>
                <p className="text-gray-600">Receive personalized meal suggestions or fast food alternatives</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">View Details</h3>
                <p className="text-gray-600">See detailed nutrition information and recipes</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Page */}
      {page === 'main' && (
        <section className="flex-1 flex flex-col items-center justify-center py-12 px-4">
          <div className="max-w-2xl w-full mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Create Custom Macro-Based Meal Suggestions</h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6">Enter your macro requirements and get meal ideas tailored just for you. Perfect for fitness, health, and meal planning!</p>
          </div>
          <div className="max-w-2xl w-full mx-auto bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-8 mb-10">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Cuisine</label>
                <select value={cuisine} onChange={e => setCuisine(e.target.value)} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200">
                  {CUISINES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Protein (g)</label>
                <input type="number" name="protein" value={macros.protein} onChange={handleInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Carbs (g)</label>
                <input type="number" name="carbs" value={macros.carbs} onChange={handleInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Fats (g)</label>
                <input type="number" name="fats" value={macros.fats} onChange={handleInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Calories</label>
                <input type="number" name="calories" value={macros.calories} onChange={handleInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
              </div>
              <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-4 mt-2">
                <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3">
                  {loading && (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
                  {loading ? 'Getting Suggestions...' : 'Get Meal Suggestions'}
                </button>
                {error && (<div className="w-full md:w-auto text-center text-red-700 bg-red-100 rounded-lg py-2 px-4 font-semibold shadow animate-fade-in">{error}</div>)}
              </div>
            </form>
          </div>
          {suggestions.length > 0 && (
            <div className="max-w-2xl w-full mx-auto mt-8 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-800">Meal Suggestions</h2>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                >
                  {loading && (<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
                  Get New Suggestions
                </button>
              </div>
              <div className="flex flex-col gap-8">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-7 border border-gray-200 hover:shadow-xl transition-transform duration-200 group cursor-pointer" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
                        {suggestion.meal}
                        {isFavorite(suggestion.meal) && (
                          <span className="text-yellow-500 text-sm">★</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isFavorite(suggestion.meal)) {
                              removeFavorite(getFavoriteId(suggestion.meal));
                            } else {
                              saveFavorite(suggestion);
                            }
                          }}
                          className={`save-button px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                            isFavorite(suggestion.meal)
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {isFavorite(suggestion.meal) ? '★ Saved' : '☆ Save'}
                        </button>
                        <span className="text-xs text-indigo-600 font-semibold">{expandedIndex === index ? 'Hide Details' : 'Show Details'}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 italic text-base">{suggestion.description}</p>
                    <div className="flex flex-wrap gap-3 text-base font-medium text-gray-800 mb-2">
                      <span className="bg-indigo-50 border border-indigo-200 rounded px-3 py-1">Protein: {suggestion.macros.protein}g</span>
                      <span className="bg-orange-50 border border-orange-200 rounded px-3 py-1">Carbs: {suggestion.macros.carbs}g</span>
                      <span className="bg-yellow-50 border border-yellow-200 rounded px-3 py-1">Fats: {suggestion.macros.fats}g</span>
                      <span className="bg-gray-50 border border-gray-200 rounded px-3 py-1">Calories: {suggestion.macros.calories}</span>
                    </div>
                    {suggestion.difference && (
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                        <span className="bg-yellow-100 rounded px-2 py-1">Δ Protein: {suggestion.difference.protein}</span>
                        <span className="bg-yellow-100 rounded px-2 py-1">Δ Carbs: {suggestion.difference.carbs}</span>
                        <span className="bg-yellow-100 rounded px-2 py-1">Δ Fats: {suggestion.difference.fats}</span>
                        <span className="bg-yellow-100 rounded px-2 py-1">Δ Calories: {suggestion.difference.calories}</span>
                      </div>
                    )}
                    {expandedIndex === index && suggestion.ingredients && (
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
                              {suggestion.ingredients.map((ing, i) => (
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
                        {suggestion.instructions && suggestion.instructions.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Step-by-Step Instructions</h4>
                            <ol className="list-decimal list-inside text-gray-700 text-base space-y-1">
                              {suggestion.instructions.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Fast Food Alternative Page */}
      {page === 'fastfood' && (
        <section className="flex-1 flex flex-col items-center justify-center py-12 px-4">
          <div className="max-w-2xl w-full mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Find Fast Food Alternatives</h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6">Enter your macro requirements and select a fast food chain to find matching menu items.</p>
          </div>
          <div className="max-w-2xl w-full mx-auto bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-8 mb-10">
            <form onSubmit={handleFFSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Fast Food Chain</label>
                <select value={selectedChain} onChange={e => setSelectedChain(e.target.value)} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200">
                  {FAST_FOOD_CHAINS.map(chain => (
                    <option key={chain} value={chain}>{chain}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Protein (g)</label>
                <input type="number" name="protein" value={ffMacros.protein} onChange={handleFFInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Carbs (g)</label>
                <input type="number" name="carbs" value={ffMacros.carbs} onChange={handleFFInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Fats (g)</label>
                <input type="number" name="fats" value={ffMacros.fats} onChange={handleFFInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Calories</label>
                <input type="number" name="calories" value={ffMacros.calories} onChange={handleFFInputChange} className="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-medium transition-all duration-200" required />
              </div>
              <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-4 mt-2">
                <button type="submit" disabled={ffLoading} className="w-full md:w-auto px-8 py-3 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3">
                  {ffLoading && (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
                  {ffLoading ? 'Getting Alternatives...' : 'Get Fast Food Alternatives'}
                </button>
                {ffError && (<div className="w-full md:w-auto text-center text-red-700 bg-red-100 rounded-lg py-2 px-4 font-semibold shadow animate-fade-in">{ffError}</div>)}
              </div>
            </form>
          </div>
          {ffResults.length > 0 && (
            <div className="max-w-2xl w-full mx-auto mt-8 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-800">Fast Food Alternatives</h2>
                <button 
                  onClick={handleFFSubmit}
                  disabled={ffLoading}
                  className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                >
                  {ffLoading && (<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
                  Get New Alternatives
                </button>
              </div>
              <div className="flex flex-col gap-8">
                {ffResults.map((result, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-7 border border-gray-200 hover:shadow-xl transition-transform duration-200 group">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
                        {result.meal}
                        {isFavorite(result.meal) && (
                          <span className="text-yellow-500 text-sm">★</span>
                        )}
                      </h3>
                      <button
                        onClick={() => {
                          if (isFavorite(result.meal)) {
                            removeFavorite(getFavoriteId(result.meal));
                          } else {
                            saveFavorite(result);
                          }
                        }}
                        className={`save-button px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                          isFavorite(result.meal)
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isFavorite(result.meal) ? '★ Saved' : '☆ Save'}
                      </button>
                    </div>
                    <p className="text-gray-700 mb-2 italic text-base">{result.description}</p>
                    <div className="flex flex-wrap gap-3 text-base font-medium text-gray-800 mb-2">
                      <span className="bg-indigo-50 border border-indigo-200 rounded px-3 py-1">Protein: {result.macros.protein}g</span>
                      <span className="bg-orange-50 border border-orange-200 rounded px-3 py-1">Carbs: {result.macros.carbs}g</span>
                      <span className="bg-yellow-50 border border-yellow-200 rounded px-3 py-1">Fats: {result.macros.fats}g</span>
                      <span className="bg-gray-50 border border-gray-200 rounded px-3 py-1">Calories: {result.macros.calories}</span>
                    </div>
                    {result.difference && (
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                        <span className="bg-yellow-100 rounded px-2 py-1">Δ Protein: {result.difference.protein}</span>
                        <span className="bg-yellow-100 rounded px-2 py-1">Δ Carbs: {result.difference.carbs}</span>
                        <span className="bg-yellow-100 rounded px-2 py-1">Δ Fats: {result.difference.fats}</span>
                        <span className="bg-yellow-100 rounded px-2 py-1">Δ Calories: {result.difference.calories}</span>
                      </div>
                    )}
                    {result.customization && (
                      <div className="mt-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                        <span className="font-semibold">Suggested Customization:</span> {result.customization}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Favorites Page */}
      {page === 'favorites' && (
        <section className="flex-1 flex flex-col items-center justify-center py-12 px-4">
          <div className="max-w-4xl w-full mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Your Favorite Meals</h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6">Manage your saved meals and get personalized suggestions based on your preferences.</p>
          </div>

          {/* Favorite-based suggestions section */}
          {favorites.length > 0 && (
            <div className="max-w-4xl w-full mx-auto bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-8 mb-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Suggestions Based on Your Favorites</h2>
                <p className="text-gray-600 mb-4">Enter your macro requirements to get new meal suggestions that match your saved preferences.</p>
                <form onSubmit={(e) => { e.preventDefault(); generateFavoriteSuggestions(); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">Protein (g)</label>
                    <input type="number" value={macros.protein} onChange={(e) => setMacros(prev => ({ ...prev, protein: e.target.value }))} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">Carbs (g)</label>
                    <input type="number" value={macros.carbs} onChange={(e) => setMacros(prev => ({ ...prev, carbs: e.target.value }))} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">Fats (g)</label>
                    <input type="number" value={macros.fats} onChange={(e) => setMacros(prev => ({ ...prev, fats: e.target.value }))} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">Calories</label>
                    <input type="number" value={macros.calories} onChange={(e) => setMacros(prev => ({ ...prev, calories: e.target.value }))} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm" required />
                  </div>
                  <div className="md:col-span-4">
                    <button type="submit" disabled={favoriteSuggestionsLoading} className="w-full px-6 py-3 rounded-full bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3">
                      {favoriteSuggestionsLoading && (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>)}
                      {favoriteSuggestionsLoading ? 'Generating...' : 'Get Personalized Suggestions'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Favorite-based suggestions */}
              {favoriteSuggestions.length > 0 && (
                <div className="mt-8 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Personalized Suggestions Based on Your Favorites</h3>
                  <div className="flex flex-col gap-6">
                    {favoriteSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => setExpandedFavoriteSuggestionIndex(expandedFavoriteSuggestionIndex === index ? null : index)}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-indigo-700">{suggestion.meal}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-indigo-600 font-semibold">{expandedFavoriteSuggestionIndex === index ? 'Hide Details' : 'Show Details'}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveFavorite(suggestion);
                              }}
                              className="save-button px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-semibold transition-all duration-200"
                            >
                              ☆ Save
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 italic">{suggestion.description}</p>
                        <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-800">
                          <span className="bg-indigo-50 border border-indigo-200 rounded px-2 py-1">Protein: {suggestion.macros.protein}g</span>
                          <span className="bg-orange-50 border border-orange-200 rounded px-2 py-1">Carbs: {suggestion.macros.carbs}g</span>
                          <span className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1">Fats: {suggestion.macros.fats}g</span>
                          <span className="bg-gray-50 border border-gray-200 rounded px-2 py-1">Calories: {suggestion.macros.calories}</span>
                        </div>
                        {suggestion.difference && (
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-2">
                            <span className="bg-yellow-100 rounded px-2 py-1">Δ Protein: {suggestion.difference.protein}</span>
                            <span className="bg-yellow-100 rounded px-2 py-1">Δ Carbs: {suggestion.difference.carbs}</span>
                            <span className="bg-yellow-100 rounded px-2 py-1">Δ Fats: {suggestion.difference.fats}</span>
                            <span className="bg-yellow-100 rounded px-2 py-1">Δ Calories: {suggestion.difference.calories}</span>
                          </div>
                        )}
                        {expandedFavoriteSuggestionIndex === index && suggestion.ingredients && (
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
                                  {suggestion.ingredients.map((ing, i) => (
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
                            {suggestion.instructions && suggestion.instructions.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Step-by-Step Instructions</h4>
                                <ol className="list-decimal list-inside text-gray-700 text-sm space-y-1">
                                  {suggestion.instructions.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Favorites list */}
          <div className="max-w-4xl w-full mx-auto">
            {favoritesLoading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <p className="text-gray-600">Loading your favorites...</p>
              </div>
            ) : favoritesError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{favoritesError}</p>
                <button onClick={loadFavorites} className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all duration-200">
                  Try Again
                </button>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">★</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Favorite Meals Yet</h3>
                <p className="text-gray-600 mb-6">Start saving meals you love to get personalized suggestions!</p>
                <button onClick={() => setPage('main')} className="px-6 py-3 rounded-full bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all duration-200">
                  Get Meal Suggestions
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-800">Saved Favorites ({favorites.length})</h2>
                  <button 
                    onClick={loadFavorites}
                    className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-semibold shadow hover:bg-gray-200 transition-all duration-200"
                  >
                    Refresh
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-transform duration-200 cursor-pointer" onClick={() => setExpandedFavoriteId(expandedFavoriteId === favorite.id ? null : favorite.id)}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                          {favorite.meal}
                          <span className="text-yellow-500">★</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-indigo-600 font-semibold">{expandedFavoriteId === favorite.id ? 'Hide Details' : 'Show Details'}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(favorite.id);
                            }}
                            className="px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 text-sm font-semibold transition-all duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 italic text-sm">{favorite.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-800 mb-3">
                        <span className="bg-indigo-50 border border-indigo-200 rounded px-2 py-1">Protein: {favorite.macros.protein}g</span>
                        <span className="bg-orange-50 border border-orange-200 rounded px-2 py-1">Carbs: {favorite.macros.carbs}g</span>
                        <span className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1">Fats: {favorite.macros.fats}g</span>
                        <span className="bg-gray-50 border border-gray-200 rounded px-2 py-1">Calories: {favorite.macros.calories}</span>
                      </div>
                      {favorite.difference && (
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                          <span className="bg-yellow-100 rounded px-2 py-1">Δ Protein: {favorite.difference.protein}</span>
                          <span className="bg-yellow-100 rounded px-2 py-1">Δ Carbs: {favorite.difference.carbs}</span>
                          <span className="bg-yellow-100 rounded px-2 py-1">Δ Fats: {favorite.difference.fats}</span>
                          <span className="bg-yellow-100 rounded px-2 py-1">Δ Calories: {favorite.difference.calories}</span>
                        </div>
                      )}
                      {expandedFavoriteId === favorite.id && favorite.ingredients && (
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
                                {favorite.ingredients.map((ing, i) => (
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
                          {favorite.instructions && favorite.instructions.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-700 mb-2">Step-by-Step Instructions</h4>
                              <ol className="list-decimal list-inside text-gray-700 text-sm space-y-1">
                                {favorite.instructions.map((step, idx) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Saved on {new Date(favorite.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-base mt-12 border-t border-gray-200 bg-white/80">
        &copy; {new Date().getFullYear()} MacroBuddy. All rights reserved.
      </footer>
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

export default App;
