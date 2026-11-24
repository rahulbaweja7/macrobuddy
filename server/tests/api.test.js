// Run with: npm run test:server  (uses an in-memory MongoDB, no setup needed)
process.env.JWT_SECRET = 'test-secret';
process.env.GROQ_API_KEY = 'test-key';
process.env.CLIENT_URL = 'http://client.test';
process.env.GOOGLE_CLIENT_ID = '';
process.env.GOOGLE_CLIENT_SECRET = '';

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let app;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = require('../app');
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const creds = { name: 'Ada', email: 'Ada@Example.com', password: 'password123' };
const register = (body = creds) => request(app).post('/api/auth/register').send(body);
const authed = (token) => ({ Authorization: `Bearer ${token}` });

const validProfile = {
  goal: 'build', sex: 'male', age: 30, heightCm: 180, weightKg: 80, activity: 'moderate',
  macros: { protein: 160, carbs: 300, fats: 64, calories: 2500 },
};

describe('auth', () => {
  test('register normalizes email, returns token, and hides password', async () => {
    const res = await register();
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'ada@example.com');
    assert.equal(res.body.user.password, undefined);
  });

  test('register rejects duplicates (case-insensitive)', async () => {
    const res = await register({ ...creds, email: 'ADA@example.com' });
    assert.equal(res.status, 409);
  });

  test('register validates input', async () => {
    assert.equal((await register({ name: 'x', email: 'x@y.com' })).status, 400);
    assert.equal((await register({ name: 'x', email: 'not-an-email', password: 'password123' })).status, 400);
    assert.equal((await register({ name: 'x', email: 'short@y.com', password: 'short' })).status, 400);
    assert.equal((await register({ name: 'x', email: { $ne: null }, password: 'password123' })).status, 400);
  });

  test('login succeeds with correct password, case-insensitive email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ADA@example.com', password: 'password123' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });

  test('login rejects wrong password and unknown user', async () => {
    assert.equal((await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'nope-nope' })).status, 401);
    assert.equal((await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'password123' })).status, 401);
  });

  test('login for a Google-only account (no password) returns 401, not 500', async () => {
    const User = require('../models/User');
    await User.create({ name: 'G', email: 'g@example.com', googleId: 'gid' });
    const res = await request(app).post('/api/auth/login').send({ email: 'g@example.com', password: 'whatever123' });
    assert.equal(res.status, 401);
  });

  test('protected routes require a valid token', async () => {
    assert.equal((await request(app).get('/api/auth/me')).status, 401);
    assert.equal((await request(app).get('/api/auth/me').set(authed('garbage'))).status, 401);
  });

  test('/api/auth/me returns the current user', async () => {
    const { body } = await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'password123' });
    const res = await request(app).get('/api/auth/me').set(authed(body.token));
    assert.equal(res.status, 200);
    assert.equal(res.body.user.name, 'Ada');
  });
});

describe('google oauth', () => {
  test('sign-in is disabled (503) when credentials are not configured', async () => {
    assert.equal((await request(app).get('/api/auth/google')).status, 503);
  });

  test('callback without config redirects to the client with an error flag', async () => {
    const res = await request(app).get('/api/auth/google/callback');
    assert.equal(res.status, 302);
    assert.equal(res.headers.location, 'http://client.test?auth_error=true');
  });

  test('exchange rejects unknown codes', async () => {
    assert.equal((await request(app).post('/api/auth/google/exchange').send({ code: 'bogus' })).status, 400);
    assert.equal((await request(app).post('/api/auth/google/exchange').send({})).status, 400);
  });
});

describe('profile', () => {
  let token;
  before(async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'password123' });
    token = res.body.token;
  });

  test('saves a valid profile and marks onboarded', async () => {
    const res = await request(app).patch('/api/user/profile').set(authed(token)).send(validProfile);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.onboarded, true);
    assert.equal(res.body.user.profile.macros.calories, 2500);
  });

  test('rejects invalid profiles', async () => {
    const bad = [
      { ...validProfile, goal: 'bulk-up' },
      { ...validProfile, age: 5 },
      { ...validProfile, weightKg: null },
      { ...validProfile, macros: { ...validProfile.macros, protein: -1 } },
      { ...validProfile, macros: {} },
    ];
    for (const body of bad) {
      const res = await request(app).patch('/api/user/profile').set(authed(token)).send(body);
      assert.equal(res.status, 400, JSON.stringify(body));
    }
  });

  test('skip marks onboarded without touching the saved profile', async () => {
    const res = await request(app).patch('/api/user/profile').set(authed(token)).send({ skip: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.profile.goal, 'build');
  });
});

describe('ai endpoints', () => {
  test('require auth', async () => {
    assert.equal((await request(app).post('/api/suggest-meals').send({})).status, 401);
  });

  test('validate macros before calling the model', async () => {
    const { body } = await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'password123' });
    const res = await request(app).post('/api/suggest-meals').set(authed(body.token))
      .send({ macros: { protein: 9999, carbs: 10, fats: 10, calories: 500 } });
    assert.equal(res.status, 400);
  });
});

describe('favorites and meal plan', () => {
  let token, otherToken, favId;
  const meal = { meal: 'Chicken Bowl', description: 'd', macros: { protein: 40, carbs: 50, fats: 10, calories: 500 }, ingredients: [], instructions: ['cook'] };

  before(async () => {
    token = (await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'password123' })).body.token;
    otherToken = (await register({ name: 'Bob', email: 'bob@example.com', password: 'password123' })).body.token;
  });

  test('save, list, and delete a favorite', async () => {
    const saved = await request(app).post('/api/favorites/save').set(authed(token)).send({ meal });
    assert.equal(saved.status, 201);
    favId = saved.body.meal.id;

    const list = await request(app).get('/api/favorites').set(authed(token));
    assert.equal(list.body.favorites.length, 1);

    const del = await request(app).delete(`/api/favorites/${favId}`).set(authed(token));
    assert.equal(del.status, 200);
    assert.equal((await request(app).get('/api/favorites').set(authed(token))).body.favorites.length, 0);
  });

  test("users cannot delete or see each other's favorites", async () => {
    const saved = await request(app).post('/api/favorites/save').set(authed(token)).send({ meal });
    const id = saved.body.meal.id;
    assert.equal((await request(app).delete(`/api/favorites/${id}`).set(authed(otherToken))).status, 404);
    assert.equal((await request(app).get('/api/favorites').set(authed(otherToken))).body.favorites.length, 0);
  });

  test('meal plan: set, fetch, validate slot, remove', async () => {
    const date = '2026-01-15';
    assert.equal((await request(app).post('/api/mealplan').set(authed(token)).send({ date, slot: 'brunch', meal })).status, 400);
    assert.equal((await request(app).post('/api/mealplan').set(authed(token)).send({ date, slot: 'lunch', meal })).status, 200);

    const got = await request(app).get('/api/mealplan').query({ date }).set(authed(token));
    assert.equal(got.body.plan.lunch.meal, 'Chicken Bowl');

    assert.equal((await request(app).delete(`/api/mealplan/${date}/lunch`).set(authed(token))).status, 200);
    const after = await request(app).get('/api/mealplan').query({ date }).set(authed(token));
    assert.equal(after.body.plan.lunch ?? null, null);
  });
});

describe('account deletion', () => {
  test('removes the user and all of their data', async () => {
    const token = (await register({ name: 'Eve', email: 'eve@example.com', password: 'password123' })).body.token;
    const meal = { meal: 'X', macros: { protein: 1, carbs: 1, fats: 1, calories: 1 } };
    await request(app).post('/api/favorites/save').set(authed(token)).send({ meal });
    await request(app).post('/api/mealplan').set(authed(token)).send({ date: '2026-02-01', slot: 'dinner', meal });

    assert.equal((await request(app).delete('/api/user').set(authed(token))).status, 200);

    const User = require('../models/User');
    const Favorite = require('../models/Favorite');
    const MealPlan = require('../models/MealPlan');
    assert.equal(await User.countDocuments({ email: 'eve@example.com' }), 0);
    assert.equal(await Favorite.countDocuments({ meal: 'X' }), 0);
    assert.equal(await MealPlan.countDocuments({ date: '2026-02-01' }), 0);
    assert.equal((await request(app).get('/api/auth/me').set(authed(token))).status, 404);
  });
});

test('health check', async () => {
  assert.equal((await request(app).get('/api/health')).body.ok, true);
});
