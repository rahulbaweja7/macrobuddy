const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { jsonrepair } = require('jsonrepair');
const connectDB = require('./db');
const authMiddleware = require('./middleware/auth');
const User = require('./models/User');
const Favorite = require('./models/Favorite');
const MealPlan = require('./models/MealPlan');

connectDB();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// ─── Google OAuth strategy ────────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;

      // Find by googleId first, then fall back to email (link accounts)
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
          });
        }
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const CUISINES = [
  'Any', 'American', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese',
  'Thai', 'Mediterranean', 'French', 'Greek', 'Middle Eastern', 'Korean',
  'Vietnamese', 'Spanish', 'African',
];

const COMMON_DISHES = [
  'Chicken Tikka Masala', 'Chana Masala', 'Tandoori Salmon', 'Paneer Tikka',
  'Butter Chicken', 'Dal Makhani', 'Palak Paneer', 'Rogan Josh', 'Biryani',
  'Aloo Gobi', 'Samosa', 'Lamb Vindaloo', 'Saag Paneer', 'Malai Kofta',
  'Fish Curry', 'Chicken Curry', 'Tandoori Chicken', 'Korma', 'Dosa',
  'Idli', 'Naan', 'Raita',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeJsonParse(content) {
  try {
    return JSON.parse(content);
  } catch {
    try {
      return JSON.parse(jsonrepair(content));
    } catch {
      const mdMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (mdMatch) {
        try { return JSON.parse(mdMatch[1]); } catch {}
      }
      const arrMatch = content.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        try { return JSON.parse(arrMatch[0]); } catch {}
      }
      const objMatch = content.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { return JSON.parse(objMatch[0]); } catch {}
      }
      throw new Error('Unable to parse JSON from OpenAI response');
    }
  }
}

function normalizeSuggestions(raw) {
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      if (Array.isArray(val.suggestions)) return val.suggestions;
      if (Array.isArray(val.meals)) return val.meals;
      if (Array.isArray(val.items)) return val.items;
    }
    return [];
  };

  return toArray(raw).map((item) => {
    const macros = item.macros || {
      protein: Number(item.protein || 0),
      carbs: Number(item.carbs || 0),
      fats: Number(item.fats || 0),
      calories: Number(item.calories || 0),
    };
    const instructions = Array.isArray(item.instructions)
      ? item.instructions
      : typeof item.instructions === 'string'
        ? item.instructions.split(/\r?\n|\.|\u2022|-/).map(s => s.trim()).filter(Boolean)
        : [];
    return {
      meal: item.meal || item.name || item.title || 'Untitled Meal',
      description: item.description || item.desc || '',
      macros,
      difference: item.difference || item.delta || undefined,
      ingredients: Array.isArray(item.ingredients)
        ? item.ingredients
        : Array.isArray(item.recipe?.ingredients)
          ? item.recipe.ingredients
          : [],
      instructions,
      customization: item.customization,
    };
  }).filter(Boolean);
}

// ─── Auth routes ─────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Google OAuth routes ──────────────────────────────────────────────────────

app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}?auth_error=true` }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const user = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    }));
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?token=${token}&user=${user}`);
  }
);

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ─── Meal suggestion routes (public) ─────────────────────────────────────────

app.post('/api/suggest-meals', async (req, res) => {
  try {
    const { macros, preferences } = req.body;
    const p = Number(macros.protein), c = Number(macros.carbs), f = Number(macros.fats);
    let macroPriority = '';
    if (p > c && p > f) macroPriority = 'Focus on high protein, low ' + (c < f ? 'carbs' : 'fats') + ' meals.';
    else if (c > p && c > f) macroPriority = 'Focus on high carb, low ' + (p < f ? 'protein' : 'fats') + ' meals.';
    else if (f > p && f > c) macroPriority = 'Focus on high fat, low ' + (p < c ? 'protein' : 'carbs') + ' meals.';
    else macroPriority = 'Balance all macros.';

    const randomSeed = Math.floor(Math.random() * 1000000);
    const excludeList = COMMON_DISHES;

    const buildPrompt = (strict) => `Given the following macro requirements:
    - Protein: ${macros.protein}g
    - Carbs: ${macros.carbs}g
    - Fats: ${macros.fats}g
    - Calories: ${macros.calories}

    Preferences: ${preferences}
    ${macroPriority}

    Do NOT suggest any of these dishes: ${excludeList.join(', ')}.
    ${strict
      ? 'Only suggest meals where the protein, carbs, fats, and calories are EACH within ±20% of the requested values. If no such dish exists, return an empty array.'
      : 'Suggest the 3 closest real, plausible meals. For each, show the macro difference.'
    }
    Suggest 3 LESS COMMON, creative, or regional meals from the selected cuisine. The meals should be significantly different from each other.
    Random seed: ${randomSeed}

    IMPORTANT: Respond with ONLY valid JSON array. No markdown or text outside JSON.
    [{ "meal": "", "description": "", "macros": { "protein": 0, "carbs": 0, "fats": 0, "calories": 0 }, "difference": { "protein": 0, "carbs": 0, "fats": 0, "calories": 0 }, "ingredients": [{ "name": "", "state": "", "quantity": "", "protein": 0, "carbs": 0, "fats": 0, "calories": 0 }], "instructions": ["Step 1..."] }]`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: buildPrompt(true) }],
      model: 'grok-3-mini',
      temperature: 0.7,
    });
    let suggestions = safeJsonParse(completion.choices[0].message.content);

    if (Array.isArray(suggestions) && suggestions.length === 0) {
      const fallback = await openai.chat.completions.create({
        messages: [{ role: 'user', content: buildPrompt(false) }],
        model: 'grok-3-mini',
        temperature: 0.7,
      });
      suggestions = safeJsonParse(fallback.choices[0].message.content);
    }

    res.json({ suggestions: normalizeSuggestions(suggestions) });
  } catch (err) {
    console.error('Error in /api/suggest-meals:', err);
    res.status(500).json({ error: 'Failed to generate meal suggestions' });
  }
});

app.post('/api/fastfood-alternatives', async (req, res) => {
  try {
    const { chain, macros } = req.body;
    const randomSeed = Math.floor(Math.random() * 1000000);
    const prompt = `You are a nutrition and fast food expert. Given the following macro requirements:
    - Protein: ${macros.protein}g
    - Carbs: ${macros.carbs}g
    - Fats: ${macros.fats}g
    - Calories: ${macros.calories}

    ONLY suggest menu items from ${chain} where ALL macros are within ±10% of the requested values.
    If no such item exists, return an empty array. Do NOT make up numbers.
    Suggest 3 DIFFERENT menu items. Each time suggest new items, avoid repeating previous results.
    Random seed: ${randomSeed}

    IMPORTANT: Respond with ONLY valid JSON array. No markdown or text outside JSON.
    [{ "meal": "", "description": "", "macros": { "protein": 0, "carbs": 0, "fats": 0, "calories": 0 }, "difference": { "protein": 0, "carbs": 0, "fats": 0, "calories": 0 }, "customization": "" }]`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'grok-3-mini',
      temperature: 0.7,
    });
    res.json({ suggestions: normalizeSuggestions(safeJsonParse(completion.choices[0].message.content)) });
  } catch (err) {
    console.error('Error in /api/fastfood-alternatives:', err);
    res.status(500).json({ error: 'Failed to generate fast food alternatives' });
  }
});

// ─── Favorites routes (protected) ────────────────────────────────────────────

app.post('/api/favorites/save', authMiddleware, async (req, res) => {
  try {
    const { meal } = req.body;
    if (!meal) return res.status(400).json({ error: 'Meal data is required' });

    const favorite = await Favorite.create({
      userId: req.userId,
      meal: meal.meal,
      description: meal.description,
      macros: meal.macros,
      ingredients: meal.ingredients || [],
      instructions: meal.instructions || [],
      customization: meal.customization,
    });

    res.status(201).json({ success: true, meal: { ...favorite.toObject(), id: favorite._id } });
  } catch (err) {
    console.error('Error saving favorite:', err);
    res.status(500).json({ error: 'Failed to save favorite meal' });
  }
});

app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ favorites: favorites.map(f => ({ ...f.toObject(), id: f._id })) });
  } catch (err) {
    console.error('Error retrieving favorites:', err);
    res.status(500).json({ error: 'Failed to retrieve favorite meals' });
  }
});

app.delete('/api/favorites/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Favorite.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Favorite meal not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ error: 'Failed to remove favorite meal' });
  }
});

app.post('/api/favorites/suggest', authMiddleware, async (req, res) => {
  try {
    const { macros, preferences } = req.body;
    const favoriteMeals = await Favorite.find({ userId: req.userId });

    if (favoriteMeals.length === 0) {
      return res.json({ suggestions: [], message: 'No favorite meals to base suggestions on' });
    }

    const favoriteCuisines = [...new Set(favoriteMeals.map(meal => {
      const text = `${meal.meal} ${meal.description}`.toLowerCase();
      return CUISINES.find(c => c !== 'Any' && text.includes(c.toLowerCase())) || 'Any';
    }))];
    const mostCommonCuisine = favoriteCuisines.filter(c => c !== 'Any')[0] || 'Any';

    const avgProtein = favoriteMeals.reduce((s, m) => s + (m.macros?.protein || 0), 0) / favoriteMeals.length;
    const avgCarbs = favoriteMeals.reduce((s, m) => s + (m.macros?.carbs || 0), 0) / favoriteMeals.length;
    const avgFats = favoriteMeals.reduce((s, m) => s + (m.macros?.fats || 0), 0) / favoriteMeals.length;

    let macroPriority = 'Balance all macros similar to your favorites.';
    if (avgProtein > avgCarbs && avgProtein > avgFats) macroPriority = 'Focus on high protein meals similar to your favorites.';
    else if (avgCarbs > avgProtein && avgCarbs > avgFats) macroPriority = 'Focus on high carb meals similar to your favorites.';
    else if (avgFats > avgProtein && avgFats > avgCarbs) macroPriority = 'Focus on high fat meals similar to your favorites.';

    const excludeList = favoriteMeals.map(m => m.meal);
    const randomSeed = Math.floor(Math.random() * 1000000);

    const prompt = `Based on the user's favorite meals, generate new meal suggestions that match their preferences.

    User's favorite meals: ${favoriteMeals.map(m => m.meal).join(', ')}
    Preferred cuisine style: ${mostCommonCuisine}
    Average macro preferences - Protein: ${avgProtein.toFixed(1)}g, Carbs: ${avgCarbs.toFixed(1)}g, Fats: ${avgFats.toFixed(1)}g

    Current macro requirements:
    - Protein: ${macros.protein}g, Carbs: ${macros.carbs}g, Fats: ${macros.fats}g, Calories: ${macros.calories}

    Preferences: ${preferences}
    ${macroPriority}

    Do NOT suggest: ${excludeList.join(', ')}.
    Only suggest meals within ±20% of the requested macros. Suggest 3 NEW meals matching the user's style.
    Random seed: ${randomSeed}

    IMPORTANT: Respond with ONLY valid JSON array. No markdown or text outside JSON.
    [{ "meal": "", "description": "", "macros": { "protein": 0, "carbs": 0, "fats": 0, "calories": 0 }, "difference": { "protein": 0, "carbs": 0, "fats": 0, "calories": 0 }, "ingredients": [{ "name": "", "state": "", "quantity": "", "protein": 0, "carbs": 0, "fats": 0, "calories": 0 }], "instructions": ["Step 1..."] }]`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'grok-3-mini',
      temperature: 0.7,
    });

    res.json({ suggestions: normalizeSuggestions(safeJsonParse(completion.choices[0].message.content)) });
  } catch (err) {
    console.error('Error generating favorite-based suggestions:', err);
    res.status(500).json({ error: 'Failed to generate favorite-based suggestions' });
  }
});

// ─── Meal plan routes (protected) ─────────────────────────────────────────────

app.get('/api/mealplan', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    const plan = await MealPlan.findOne({ userId: req.userId, date });
    res.json({ plan: plan || { date, breakfast: null, lunch: null, dinner: null } });
  } catch (err) {
    console.error('Error fetching meal plan:', err);
    res.status(500).json({ error: 'Failed to fetch meal plan' });
  }
});

app.post('/api/mealplan', authMiddleware, async (req, res) => {
  try {
    const { date, slot, meal } = req.body;
    if (!date || !slot || !meal) {
      return res.status(400).json({ error: 'date, slot, and meal are required' });
    }
    if (!['breakfast', 'lunch', 'dinner'].includes(slot)) {
      return res.status(400).json({ error: 'slot must be breakfast, lunch, or dinner' });
    }

    const plan = await MealPlan.findOneAndUpdate(
      { userId: req.userId, date },
      { $set: { [slot]: meal } },
      { upsert: true, new: true }
    );
    res.json({ success: true, plan });
  } catch (err) {
    console.error('Error saving meal plan:', err);
    res.status(500).json({ error: 'Failed to save meal plan' });
  }
});

app.delete('/api/mealplan/:date/:slot', authMiddleware, async (req, res) => {
  try {
    const { date, slot } = req.params;
    if (!['breakfast', 'lunch', 'dinner'].includes(slot)) {
      return res.status(400).json({ error: 'slot must be breakfast, lunch, or dinner' });
    }

    await MealPlan.findOneAndUpdate(
      { userId: req.userId, date },
      { $set: { [slot]: null } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing meal from plan:', err);
    res.status(500).json({ error: 'Failed to remove meal from plan' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
