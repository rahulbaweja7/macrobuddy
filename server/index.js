const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();
const { jsonrepair } = require('jsonrepair');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to safely parse JSON from OpenAI response
function safeJsonParse(content) {
  try {
    // First, try to parse the content directly
    return JSON.parse(content);
  } catch (error) {
    console.log('Direct JSON parse failed, attempting to repair JSON...');
    try {
      // Attempt to repair the JSON using jsonrepair
      const repaired = jsonrepair(content);
      return JSON.parse(repaired);
    } catch (repairError) {
      console.log('jsonrepair failed, attempting to extract JSON...');
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.log('JSON extraction from markdown failed');
        }
      }
      // Try to find JSON array or object in the content
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (e) {
          console.log('Array extraction failed');
        }
      }
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          return JSON.parse(objectMatch[0]);
        } catch (e) {
          console.log('Object extraction failed');
        }
      }
      console.log('All JSON parsing attempts failed');
      console.log('Raw content:', content);
      throw new Error('Unable to parse JSON from OpenAI response');
    }
  }
}

// List of common/popular dishes to exclude for variety
const COMMON_DISHES = [
  "Chicken Tikka Masala",
  "Chana Masala",
  "Tandoori Salmon",
  "Paneer Tikka",
  "Butter Chicken",
  "Dal Makhani",
  "Palak Paneer",
  "Rogan Josh",
  "Biryani",
  "Aloo Gobi",
  "Samosa",
  "Lamb Vindaloo",
  "Saag Paneer",
  "Malai Kofta",
  "Fish Curry",
  "Chicken Curry",
  "Tandoori Chicken",
  "Korma",
  "Dosa",
  "Idli",
  "Naan",
  "Raita"
];

// In-memory storage for favorite meals (in production, use a database)
let favoriteMeals = [];

// Helper to extract previous suggestions from request (if any)
function getPreviousSuggestions(req) {
  // Optionally, you can pass previous suggestions from the frontend in req.body.previousSuggestions
  // For now, we use none (stateless), but you can expand this for even more control
  return [];
}

// Endpoint to get meal suggestions
app.post('/api/suggest-meals', async (req, res) => {
  try {
    const { macros, preferences } = req.body;
    let macroPriority = '';
    const p = Number(macros.protein);
    const c = Number(macros.carbs);
    const f = Number(macros.fats);
    if (p > c && p > f) macroPriority = 'Focus on high protein, low ' + (c < f ? 'carbs' : 'fats') + ' meals.';
    else if (c > p && c > f) macroPriority = 'Focus on high carb, low ' + (p < f ? 'protein' : 'fats') + ' meals.';
    else if (f > p && f > c) macroPriority = 'Focus on high fat, low ' + (p < c ? 'protein' : 'carbs') + ' meals.';
    else macroPriority = 'Balance all macros.';
    const randomSeed = Math.floor(Math.random() * 1000000);
    const previousSuggestions = getPreviousSuggestions(req);
    const excludeList = previousSuggestions.length > 0 ? previousSuggestions : COMMON_DISHES;
    const prompt = `Given the following macro requirements:
    - Protein: ${macros.protein}g
    - Carbs: ${macros.carbs}g
    - Fats: ${macros.fats}g
    - Calories: ${macros.calories}
    
    Preferences: ${preferences}
    ${macroPriority}
    
    Do NOT suggest any of these dishes: ${excludeList.join(", ")}.
    Only suggest meals where the protein, carbs, fats, and calories are EACH within ±20% of the requested values. If no such dish exists, say so and do not suggest any dish that does not meet this requirement. Do not make up numbers to fit the macros. Instead, only suggest real, plausible dishes that naturally fit the macros.
    Suggest 3 LESS COMMON, creative, or regional meals from the selected cuisine that match these macros as closely as possible (within ±20% for each macro, if possible). The meals should be significantly different from each other, not just variations of the same dish with different quantities. Each time this is requested, you must suggest new dishes that have not been suggested before, and avoid repeating previous results.

    For each meal, provide:
    1. The meal name
    2. A brief description
    3. The macro breakdown (protein, carbs, fats, calories)
    4. A detailed recipe:
       - For each ingredient, specify: name, state (raw/cooked), exact quantity with units, and calories for that amount.
       - Specify if the weight is for raw or cooked ingredient.
       - Specify the cooking method and step-by-step instructions.
       - Use only common ingredients and realistic cooking methods.
    5. A nutrition table: for each ingredient, show name, state, quantity, protein, carbs, fats, and calories.
    6. If the macros are not an exact match, show the difference for each macro in a 'difference' field as a number (positive or negative, but do not use a plus sign, just the number).
    7. Step-by-step cooking instructions as an array of strings.
    
    Random seed: ${randomSeed}
    
    IMPORTANT: Respond with ONLY valid JSON. Do not include any markdown formatting, explanations, or text outside the JSON structure.
    
    Format the response as a JSON array of objects with the following structure. If no dish fits, return an empty array:
    [
      {
        "meal": "meal name",
        "description": "brief description",
        "macros": {
          "protein": number,
          "carbs": number,
          "fats": number,
          "calories": number
        },
        "difference": {
          "protein": number,
          "carbs": number,
          "fats": number,
          "calories": number
        },
        "ingredients": [
          {
            "name": "ingredient name",
            "state": "raw/cooked",
            "quantity": "amount with units",
            "protein": number,
            "carbs": number,
            "fats": number,
            "calories": number
          }
        ],
        "instructions": [
          "Step 1...",
          "Step 2..."
        ]
      }
    ]`;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 1.1,
    });
    let suggestions = safeJsonParse(completion.choices[0].message.content);
    // If no suggestions found, try a second, looser prompt for closest matches
    if (Array.isArray(suggestions) && suggestions.length === 0) {
      const fallbackPrompt = `Given the following macro requirements:
      - Protein: ${macros.protein}g
      - Carbs: ${macros.carbs}g
      - Fats: ${macros.fats}g
      - Calories: ${macros.calories}
      
      Preferences: ${preferences}
      ${macroPriority}
      
      Do NOT suggest any of these dishes: ${excludeList.join(", ")}.
      If you cannot find meals where the protein, carbs, fats, and calories are EACH within ±20% of the requested values, suggest the 3 closest real, plausible meals from the selected cuisine. For each, show the difference for each macro in a 'difference' field. The meals should be significantly different from each other, not just variations of the same dish with different quantities. Each time this is requested, you must suggest new dishes that have not been suggested before, and avoid repeating previous results.
      
      For each meal, provide:
      1. The meal name
      2. A brief description
      3. The macro breakdown (protein, carbs, fats, calories)
      4. A detailed recipe:
         - For each ingredient, specify: name, state (raw/cooked), exact quantity with units, and calories for that amount.
         - Specify if the weight is for raw or cooked ingredient.
         - Specify the cooking method and step-by-step instructions.
         - Use only common ingredients and realistic cooking methods.
      5. A nutrition table: for each ingredient, show name, state, quantity, protein, carbs, fats, and calories.
      6. If the macros are not an exact match, show the difference for each macro in a 'difference' field as a number (positive or negative, but do not use a plus sign, just the number).
      7. Step-by-step cooking instructions as an array of strings.
      
      Random seed: ${randomSeed}
      
      IMPORTANT: Respond with ONLY valid JSON. Do not include any markdown formatting, explanations, or text outside the JSON structure.
      
      Format the response as a JSON array of objects with the following structure. If no dish fits, return an empty array:
      [
        {
          "meal": "meal name",
          "description": "brief description",
          "macros": {
            "protein": number,
            "carbs": number,
            "fats": number,
            "calories": number
          },
          "difference": {
            "protein": number,
            "carbs": number,
            "fats": number,
            "calories": number
          },
          "ingredients": [
            {
              "name": "ingredient name",
              "state": "raw/cooked",
              "quantity": "amount with units",
              "protein": number,
              "carbs": number,
              "fats": number,
              "calories": number
            }
          ],
          "instructions": [
            "Step 1...",
            "Step 2..."
          ]
        }
      ]`;
      const fallbackCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: fallbackPrompt }],
        model: "gpt-3.5-turbo",
        temperature: 1.1,
      });
      suggestions = safeJsonParse(fallbackCompletion.choices[0].message.content);
    }
    res.json({ suggestions });
  } catch (error) {
    console.error('Error in /api/suggest-meals:', error);
    if (error.message.includes('Unable to parse JSON')) {
      res.status(500).json({ error: 'Failed to parse meal suggestions from AI response' });
    } else {
      res.status(500).json({ error: 'Failed to generate meal suggestions' });
    }
  }
});

// Endpoint to get fast food alternatives
app.post('/api/fastfood-alternatives', async (req, res) => {
  try {
    const { chain, macros } = req.body;
    const randomSeed = Math.floor(Math.random() * 1000000);
    const previousSuggestions = getPreviousSuggestions(req);
    const prompt = `You are a nutrition and fast food expert. Given the following macro requirements:
    - Protein: ${macros.protein}g
    - Carbs: ${macros.carbs}g
    - Fats: ${macros.fats}g
    - Calories: ${macros.calories}
    
    ONLY suggest menu items from ${chain} where ALL of the following are true:
    - Protein is within ±10% of the requested value
    - Carbs are within ±10% of the requested value
    - Fats are within ±10% of the requested value
    - Calories are within ±10% of the requested value
    If no such item exists, return an empty array and do NOT suggest any item that does not meet this requirement. Do NOT make up numbers to fit the macros. Only suggest real, plausible menu items that naturally fit the macros. Be strict and do not relax these requirements.
    Suggest 3 DIFFERENT menu items from ${chain} that match these macros as closely as possible (within ±10% for each macro, if possible). The items should be significantly different from each other, not just variations of the same item with different quantities. Each time this is requested, you must suggest new items that have not been suggested before, and avoid repeating previous results.

    For each item, provide:
    1. The menu item name
    2. A brief description
    3. The macro breakdown (protein, carbs, fats, calories)
    4. If the macros are not an exact match, show the difference for each macro in a 'difference' field as a number (positive or negative, but do not use a plus sign, just the number).
    5. A brief note about any modifications or customizations that might help match the macros better (e.g., "Order without the bun to reduce carbs", "Add extra protein to increase protein content")
    
    Random seed: ${randomSeed}
    
    IMPORTANT: Respond with ONLY valid JSON. Do not include any markdown formatting, explanations, or text outside the JSON structure.
    
    Format the response as a JSON array of objects with the following structure. If no item fits, return an empty array:
    [
      {
        "meal": "menu item name",
        "description": "brief description",
        "macros": {
          "protein": number,
          "carbs": number,
          "fats": number,
          "calories": number
        },
        "difference": {
          "protein": number,
          "carbs": number,
          "fats": number,
          "calories": number
        },
        "customization": "suggested modifications to better match macros"
      }
    ]`;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 1.1,
    });
    const suggestions = safeJsonParse(completion.choices[0].message.content);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error in /api/fastfood-alternatives:', error);
    if (error.message.includes('Unable to parse JSON')) {
      res.status(500).json({ error: 'Failed to parse fast food alternatives from AI response' });
    } else {
      res.status(500).json({ error: 'Failed to generate fast food alternatives' });
    }
  }
});

// Endpoint to save a meal as favorite
app.post('/api/favorites/save', (req, res) => {
  try {
    const { meal } = req.body;
    if (!meal) {
      return res.status(400).json({ error: 'Meal data is required' });
    }
    
    // Add timestamp and unique ID
    const favoriteMeal = {
      ...meal,
      id: Date.now().toString(),
      savedAt: new Date().toISOString()
    };
    
    favoriteMeals.push(favoriteMeal);
    res.json({ success: true, message: 'Meal saved to favorites', meal: favoriteMeal });
  } catch (error) {
    console.error('Error saving favorite meal:', error);
    res.status(500).json({ error: 'Failed to save favorite meal' });
  }
});

// Endpoint to get all favorite meals
app.get('/api/favorites', (req, res) => {
  try {
    res.json({ favorites: favoriteMeals });
  } catch (error) {
    console.error('Error retrieving favorite meals:', error);
    res.status(500).json({ error: 'Failed to retrieve favorite meals' });
  }
});

// Endpoint to remove a meal from favorites
app.delete('/api/favorites/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = favoriteMeals.length;
    favoriteMeals = favoriteMeals.filter(meal => meal.id !== id);
    
    if (favoriteMeals.length === initialLength) {
      return res.status(404).json({ error: 'Favorite meal not found' });
    }
    
    res.json({ success: true, message: 'Meal removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite meal:', error);
    res.status(500).json({ error: 'Failed to remove favorite meal' });
  }
});

// Endpoint to generate meal suggestions based on favorite meals
app.post('/api/favorites/suggest', async (req, res) => {
  try {
    const { macros, preferences } = req.body;
    
    if (favoriteMeals.length === 0) {
      return res.json({ suggestions: [], message: 'No favorite meals to base suggestions on' });
    }
    
    // Analyze favorite meals to understand user preferences
    const favoriteCuisines = [...new Set(favoriteMeals.map(meal => {
      // Extract cuisine from meal name or description
      const mealText = `${meal.meal} ${meal.description}`.toLowerCase();
      for (const cuisine of CUISINES) {
        if (cuisine !== 'Any' && mealText.includes(cuisine.toLowerCase())) {
          return cuisine;
        }
      }
      return 'Any';
    }))];
    
    const mostCommonCuisine = favoriteCuisines.filter(c => c !== 'Any')[0] || 'Any';
    
    // Calculate average macro ratios from favorites
    const avgProtein = favoriteMeals.reduce((sum, meal) => sum + meal.macros.protein, 0) / favoriteMeals.length;
    const avgCarbs = favoriteMeals.reduce((sum, meal) => sum + meal.macros.carbs, 0) / favoriteMeals.length;
    const avgFats = favoriteMeals.reduce((sum, meal) => sum + meal.macros.fats, 0) / favoriteMeals.length;
    
    // Determine macro priority based on favorites
    let macroPriority = '';
    if (avgProtein > avgCarbs && avgProtein > avgFats) {
      macroPriority = 'Focus on high protein meals similar to your favorites.';
    } else if (avgCarbs > avgProtein && avgCarbs > avgFats) {
      macroPriority = 'Focus on high carb meals similar to your favorites.';
    } else if (avgFats > avgProtein && avgFats > avgCarbs) {
      macroPriority = 'Focus on high fat meals similar to your favorites.';
    } else {
      macroPriority = 'Balance all macros similar to your favorites.';
    }
    
    const randomSeed = Math.floor(Math.random() * 1000000);
    const excludeList = favoriteMeals.map(meal => meal.meal);
    
    const prompt = `Based on the user's favorite meals, generate new meal suggestions that match their preferences.

    User's favorite meals: ${favoriteMeals.map(meal => meal.meal).join(', ')}
    Preferred cuisine style: ${mostCommonCuisine}
    Average macro preferences from favorites:
    - Protein: ${avgProtein.toFixed(1)}g
    - Carbs: ${avgCarbs.toFixed(1)}g
    - Fats: ${avgFats.toFixed(1)}g

    Current macro requirements:
    - Protein: ${macros.protein}g
    - Carbs: ${macros.carbs}g
    - Fats: ${macros.fats}g
    - Calories: ${macros.calories}
    
    Preferences: ${preferences}
    ${macroPriority}
    
    Do NOT suggest any of these dishes: ${excludeList.join(", ")}.
    Only suggest meals where the protein, carbs, fats, and calories are EACH within ±20% of the requested values. If no such dish exists, say so and do not suggest any dish that does not meet this requirement. Do not make up numbers to fit the macros. Instead, only suggest real, plausible dishes that naturally fit the macros.
    Suggest 3 NEW meals that match the user's style and preferences from their favorites, but are different dishes. The meals should be significantly different from each other and from their existing favorites.

    For each meal, provide:
    1. The meal name
    2. A brief description
    3. The macro breakdown (protein, carbs, fats, calories)
    4. A detailed recipe:
       - For each ingredient, specify: name, state (raw/cooked), exact quantity with units, and calories for that amount.
       - Specify if the weight is for raw or cooked ingredient.
       - Specify the cooking method and step-by-step instructions.
       - Use only common ingredients and realistic cooking methods.
    5. A nutrition table: for each ingredient, show name, state, quantity, protein, carbs, fats, and calories.
    6. If the macros are not an exact match, show the difference for each macro in a 'difference' field as a number (positive or negative, but do not use a plus sign, just the number).
    7. Step-by-step cooking instructions as an array of strings.
    
    Random seed: ${randomSeed}
    
    IMPORTANT: Respond with ONLY valid JSON. Do not include any markdown formatting, explanations, or text outside the JSON structure.
    
    Format the response as a JSON array of objects with the following structure. If no dish fits, return an empty array:
    [
      {
        "meal": "meal name",
        "description": "brief description",
        "macros": {
          "protein": number,
          "carbs": number,
          "fats": number,
          "calories": number
        },
        "difference": {
          "protein": number,
          "carbs": number,
          "fats": number,
          "calories": number
        },
        "ingredients": [
          {
            "name": "ingredient name",
            "state": "raw/cooked",
            "quantity": "amount with units",
            "protein": number,
            "carbs": number,
            "fats": number,
            "calories": number
          }
        ],
        "instructions": [
          "Step 1...",
          "Step 2..."
        ]
      }
    ]`;
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 1.1,
    });
    
    const suggestions = safeJsonParse(completion.choices[0].message.content);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating favorite-based suggestions:', error);
    if (error.message.includes('Unable to parse JSON')) {
      res.status(500).json({ error: 'Failed to parse favorite-based suggestions from AI response' });
    } else {
      res.status(500).json({ error: 'Failed to generate favorite-based suggestions' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 