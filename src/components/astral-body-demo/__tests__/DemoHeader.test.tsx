
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DemoHeader from '@/components/astral-body-demo/DemoHeader';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DemoHeader Component', () => {
  test('renders the header with title', () => {
    render(
      <BrowserRouter>
        <DemoHeader />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Astral Body Visualization')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  test('navigates to home when back button is clicked', () => {
    render(
      <BrowserRouter>
        <DemoHeader />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Back to Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
