
import React from 'react';
import { render, screen } from '@testing-library/react';
import GlowEffect from '@/components/GlowEffect';

describe('GlowEffect Component', () => {
  test('renders with default props', () => {
    render(<GlowEffect>Test Content</GlowEffect>);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<GlowEffect className="custom-class">Test Content</GlowEffect>);
    
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('relative');
  });

  test('applies different intensities', () => {
    const { rerender, container } = render(
      <GlowEffect intensity="high">High Intensity</GlowEffect>
    );
    
    const highStyle = window.getComputedStyle(container.firstChild as Element);
    expect(highStyle.boxShadow).toContain('30px');
    
    rerender(<GlowEffect intensity="low">Low Intensity</GlowEffect>);
    
    const lowStyle = window.getComputedStyle(container.firstChild as Element);
    expect(lowStyle.boxShadow).toContain('10px');
  });

  test('applies animation class', () => {
    const { container } = render(
      <GlowEffect animation="pulse">Pulsing Glow</GlowEffect>
    );
    
    expect(container.firstChild).toHaveClass('animate-pulse-glow');
  });
});
