import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => localStorage.clear());

test('shows the login page when signed out', async () => {
  render(<App />);
  expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
});

test('shows the app header when a user is signed in', async () => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify({
    id: '1', name: 'Test User', email: 't@example.com', onboarded: true, profile: null,
  }));
  render(<App />);
  expect(await screen.findByText('Sign out')).toBeInTheDocument();
});
