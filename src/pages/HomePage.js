import React from 'react';

export default function HomePage({ setPage }) {
  return (
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
  );
} 