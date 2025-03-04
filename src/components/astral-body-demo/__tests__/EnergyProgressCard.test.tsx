
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnergyProgressCard from '@/components/astral-body-demo/EnergyProgressCard';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn()
  }))
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

jest.mock('@/integrations/supabase/client', () => ({
  incrementEnergyPoints: jest.fn().mockResolvedValue(100)
}));

describe('EnergyProgressCard Component', () => {
  const mockProps = {
    userProfile: {
      energy_points: 50,
      name: 'Test User'
    },
    updateUserProfile: jest.fn(),
    energyPoints: 50,
    incrementAmount: 100,
    setIncrementAmount: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders energy progress information', () => {
    render(<EnergyProgressCard {...mockProps} />);
    
    expect(screen.getByText('Energy Progress')).toBeInTheDocument();
    expect(screen.getByText('50 points')).toBeInTheDocument();
    expect(screen.getByText('Astral Development')).toBeInTheDocument();
  });

  test('handles increment button click', async () => {
    const { incrementEnergyPoints } = require('@/integrations/supabase/client');
    const mockToast = { toast: jest.fn() };
    (useToast as jest.Mock).mockReturnValue(mockToast);
    
    render(<EnergyProgressCard {...mockProps} />);
    
    fireEvent.click(screen.getByText('Add 100 Energy Points'));
    
    expect(incrementEnergyPoints).toHaveBeenCalledWith('test-user-id', 100);
    expect(mockProps.updateUserProfile).toHaveBeenCalled();
  });

  test('changes increment amount when amount buttons are clicked', () => {
    render(<EnergyProgressCard {...mockProps} />);
    
    fireEvent.click(screen.getByText('+50'));
    expect(mockProps.setIncrementAmount).toHaveBeenCalledWith(50);
    
    fireEvent.click(screen.getByText('+200'));
    expect(mockProps.setIncrementAmount).toHaveBeenCalledWith(200);
  });

  test('shows sign in message when userProfile is null', () => {
    render(
      <EnergyProgressCard 
        {...mockProps} 
        userProfile={null}
      />
    );
    
    expect(screen.getByText('Sign in to track your energy progress')).toBeInTheDocument();
  });
});
