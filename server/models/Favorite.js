const mongoose = require('mongoose');

const macrosSchema = new mongoose.Schema({
  protein: Number,
  carbs: Number,
  fats: Number,
  calories: Number,
}, { _id: false });

const ingredientSchema = new mongoose.Schema({
  name: String,
  state: String,
  quantity: String,
  protein: Number,
  carbs: Number,
  fats: Number,
  calories: Number,
}, { _id: false });

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meal: { type: String, required: true },
  description: String,
  macros: macrosSchema,
  ingredients: [ingredientSchema],
  instructions: [String],
  customization: String,
}, { timestamps: true });

favoriteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
