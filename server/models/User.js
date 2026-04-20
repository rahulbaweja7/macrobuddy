const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, default: null },
  googleId: { type: String, default: null },
  onboarded: { type: Boolean, default: false },
  profile: {
    goal:     { type: String, default: null },   // 'lose' | 'maintain' | 'build'
    sex:      { type: String, default: null },   // 'male' | 'female'
    age:      { type: Number, default: null },
    heightCm: { type: Number, default: null },
    weightKg: { type: Number, default: null },
    activity: { type: String, default: null },   // 'sedentary'|'light'|'moderate'|'active'|'very_active'
    macros: {
      protein:  { type: Number, default: null },
      carbs:    { type: Number, default: null },
      fats:     { type: Number, default: null },
      calories: { type: Number, default: null },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
