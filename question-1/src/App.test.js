import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.js';

test('renders stock analysis title', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const titleElement = screen.getByText(/Stock Analysis/i);
  expect(titleElement).toBeInTheDocument();
}); 