import React from 'react';

export default function HomePage({ setPage }) {
  return (
    <section className="relative flex-1 flex flex-col items-center justify-center py-16 px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-faded" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-indigo-400/20 blur-3xl rounded-full animate-blob" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-fuchsia-400/20 blur-3xl rounded-full animate-blob" />

      <div className="relative max-w-4xl w-full mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight bg-gradient-to-r from-gray-900 via-indigo-700 to-fuchsia-700 bg-clip-text text-transparent">
          Your Personal Macro Nutrition Assistant
        </h1>
        <p className="text-lg md:text-2xl text-gray-600/90 mb-10">
          Get personalized meal suggestions and fast food alternatives based on your macro requirements
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => setPage('main')}
            className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-glow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Get Meal Suggestions
          </button>
          <button
            onClick={() => setPage('fastfood')}
            className="px-8 py-4 rounded-full bg-white text-indigo-700 font-bold text-lg border-2 border-indigo-600/70 hover:border-indigo-700 hover:bg-indigo-50/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Find Fast Food Alternatives
          </button>
        </div>
        <div className="mt-6 text-sm text-gray-500">No signup required • Free to try</div>
      </div>
      <div className="max-w-4xl w-full mx-auto grid md:grid-cols-2 gap-8 mb-16">
        <div className="group bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200 hover:border-indigo-200 transition-all duration-200 hover:-translate-y-1">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <img src="https://img.icons8.com/color/96/restaurant.png" alt="Meal Icon" className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Meal Suggestions</h3>
          <p className="text-gray-600">
            Get personalized meal suggestions based on your macro requirements. Choose your preferred cuisine and get detailed recipes with exact quantities and nutrition information.
          </p>
        </div>
        <div className="group bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200 hover:border-indigo-200 transition-all duration-200 hover:-translate-y-1">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <img src="https://img.icons8.com/color/96/fast-food.png" alt="Fast Food Icon" className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast Food Alternatives</h3>
          <p className="text-gray-600">
            Find macro-friendly options at your favorite fast food chains. Get detailed nutrition information and make informed choices when eating out.
          </p>
        </div>
      </div>
      <div className="relative max-w-4xl w-full mx-auto bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="absolute inset-x-0 -top-0.5 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-2xl font-bold text-indigo-600">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Your Macros</h3>
            <p className="text-gray-600">Specify your protein, carbs, fats, and calorie requirements</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-2xl font-bold text-indigo-600">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Get Suggestions</h3>
            <p className="text-gray-600">Receive personalized meal suggestions or fast food alternatives</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
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