const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./db');

// Fail fast on misconfiguration instead of erroring on the first request
const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
if (!process.env.GROQ_API_KEY) console.warn('GROQ_API_KEY is not set — AI endpoints will fail');
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth is not configured — Google sign-in is disabled');
}

const app = require('./app');
const port = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
