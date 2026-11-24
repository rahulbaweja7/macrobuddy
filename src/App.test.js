import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => localStorage.clear());

test('opens on the landing page when signed out', async () => {
  render(<App />);
  expect(await screen.findByText(/left\. here's dinner/i)).toBeInTheDocument();
  expect(screen.getAllByText('Make an account').length).toBeGreaterThan(0);
});

test('landing page leads to sign in and back', async () => {
  render(<App />);
  userEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
  userEvent.click(screen.getByText(/back to home/i));
  expect(await screen.findByText(/left\. here's dinner/i)).toBeInTheDocument();
});

test('signed-in users also land on the landing page, inside the app shell', async () => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify({
    id: '1', name: 'Test User', email: 't@example.com', onboarded: true, profile: null,
  }));
  render(<App />);
  expect(await screen.findByText('Sign out')).toBeInTheDocument();
  expect(screen.getByText(/left\. here's dinner/i)).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Open meal suggestions' })).toHaveLength(2);
});
