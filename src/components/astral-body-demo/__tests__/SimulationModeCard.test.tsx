
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SimulationModeCard from '@/components/astral-body-demo/SimulationModeCard';

describe('SimulationModeCard Component', () => {
  const mockProps = {
    simulatedPoints: 500,
    setSimulatedPoints: jest.fn(),
    isSimulating: false,
    setIsSimulating: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders simulation mode card correctly', () => {
    render(<SimulationModeCard {...mockProps} />);
    
    expect(screen.getByText('Simulation Mode')).toBeInTheDocument();
    expect(screen.getByText('0 points')).toBeInTheDocument();
    expect(screen.getByText('2000 points')).toBeInTheDocument();
    expect(screen.getByText('500 points')).toBeInTheDocument();
  });

  test('toggles simulation mode when button is clicked', () => {
    render(<SimulationModeCard {...mockProps} />);
    
    fireEvent.click(screen.getByText('Show Simulation'));
    expect(mockProps.setIsSimulating).toHaveBeenCalledWith(true);
    
    // Reset and test the other state
    jest.clearAllMocks();
    render(<SimulationModeCard {...mockProps} isSimulating={true} />);
    
    fireEvent.click(screen.getByText('Show Real Progress'));
    expect(mockProps.setIsSimulating).toHaveBeenCalledWith(false);
  });
});
