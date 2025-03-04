
import React from 'react';
import { render, screen } from '@testing-library/react';
import AstralBodyDemo from '@/pages/AstralBodyDemo';
import { BrowserRouter } from 'react-router-dom';

// Mock the components and hooks
jest.mock('@/components/Layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock('@/components/astral-body-demo/DemoHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="demo-header">Demo Header</div>
}));

jest.mock('@/components/astral-body-demo/DemoContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="demo-container">{children}</div>
}));

jest.mock('@/components/astral-body-demo/DemoCards', () => ({
  __esModule: true,
  default: () => <div data-testid="demo-cards">Demo Cards</div>
}));

jest.mock('@/components/astral-body-demo/VisualizationTabs', () => ({
  __esModule: true,
  default: () => <div data-testid="visualization-tabs">Visualization Tabs</div>
}));

jest.mock('@/components/astral-body-demo/EnergyThresholds', () => ({
  __esModule: true,
  default: () => <div data-testid="energy-thresholds">Energy Thresholds</div>
}));

jest.mock('@/hooks/useAstralDemo', () => ({
  useAstralDemo: jest.fn(() => ({
    userProfile: { energy_points: 100 },
    updateUserProfile: jest.fn(),
    simulatedPoints: 0,
    setSimulatedPoints: jest.fn(),
    isSimulating: false,
    setIsSimulating: jest.fn(),
    incrementAmount: 50,
    setIncrementAmount: jest.fn(),
    energyPoints: 100
  }))
}));

describe('AstralBodyDemo Page', () => {
  test('renders the astral body demo page with all components', () => {
    render(
      <BrowserRouter>
        <AstralBodyDemo />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('demo-container')).toBeInTheDocument();
    expect(screen.getByTestId('demo-header')).toBeInTheDocument();
    expect(screen.getByTestId('demo-cards')).toBeInTheDocument();
    expect(screen.getByTestId('visualization-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('energy-thresholds')).toBeInTheDocument();
  });
});
