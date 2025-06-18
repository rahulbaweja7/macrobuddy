const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
    Only suggest meals where the protein, carbs, fats, and calories are EACH within ±10% of the requested values. If no such dish exists, say so and do not suggest any dish that does not meet this requirement. Do not make up numbers to fit the macros. Instead, only suggest real, plausible dishes that naturally fit the macros.
    Suggest 3 LESS COMMON, creative, or regional meals from the selected cuisine that match these macros as closely as possible (within ±10% for each macro, if possible). The meals should be significantly different from each other, not just variations of the same dish with different quantities. Each time this is requested, you must suggest new dishes that have not been suggested before, and avoid repeating previous results.

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
    
    Format the response as a JSON array of objects with the following structure. If no dish fits, return an empty array or a message saying so:
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
        },
        ...
      ],
      "instructions": [
        "Step 1...",
        "Step 2...",
        ...
      ]
    }`;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 1.1,
    });
    const suggestions = JSON.parse(completion.choices[0].message.content);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate meal suggestions' });
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
    
    Format the response as a JSON array of objects with the following structure. If no item fits, return an empty array or a message saying so:
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
    }`;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 1.1,
    });
    const suggestions = JSON.parse(completion.choices[0].message.content);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate fast food alternatives' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 