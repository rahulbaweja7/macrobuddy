import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import api from './utils/api';

jest.mock('./utils/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  GOOGLE_AUTH_URL: 'http://localhost:3001/api/auth/google',
}));

const savedUser = { id: '1', name: 'Test User', email: 't@example.com', onboarded: true, profile: null };
const headline = /match your macros/i;

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

const saveSession = () => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify(savedUser));
};

test('opens on a landing page that says what MacroBuddy is, when signed out', async () => {
  render(<App />);
  expect(await screen.findByText(headline)).toBeInTheDocument();
  expect(screen.getByText(/meal planner for people counting macros/i)).toBeInTheDocument();
  expect(screen.getAllByText('Make an account').length).toBeGreaterThan(0);
});

test('landing page leads to sign in and back', async () => {
  render(<App />);
  userEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
  userEvent.click(screen.getByText(/back to home/i));
  expect(await screen.findByText(headline)).toBeInTheDocument();
});

test('signed-in users also land on the landing page, inside the app shell', async () => {
  saveSession();
  api.get.mockResolvedValue({ data: { user: savedUser } });
  render(<App />);
  expect(await screen.findByText('Sign out')).toBeInTheDocument();
  expect(screen.getByText(headline)).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Open meal suggestions' })).toHaveLength(2);
});

test('a stale saved session (server says 401) falls back to the signed-out landing page', async () => {
  saveSession();
  api.get.mockRejectedValue({ response: { status: 401 } });
  render(<App />);
  expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
});

test('a network error keeps the saved session', async () => {
  saveSession();
  api.get.mockRejectedValue(new Error('Network Error'));
  render(<App />);
  expect(await screen.findByText('Sign out')).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBe('test-token');
});
