const mongoose = require('mongoose');

const mealSlotSchema = new mongoose.Schema({
  meal: String,
  description: String,
  macros: {
    protein: Number,
    carbs: Number,
    fats: Number,
    calories: Number,
  },
  ingredients: [{ type: mongoose.Schema.Types.Mixed }],
  instructions: [String],
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  breakfast: { type: mealSlotSchema, default: null },
  lunch: { type: mealSlotSchema, default: null },
  dinner: { type: mealSlotSchema, default: null },
}, { timestamps: true });

mealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
