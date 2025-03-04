
import React from 'react';
import { render } from '@testing-library/react';
import DemoContainer from '@/components/astral-body-demo/DemoContainer';

// Mock framer-motion
jest.mock('framer-motion', () => require('../../../__mocks__/framer-motion'));

describe('DemoContainer Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <DemoContainer>
        <div>Test Children Content</div>
      </DemoContainer>
    );
    
    expect(getByText('Test Children Content')).toBeInTheDocument();
  });

  test('renders with correct classes', () => {
    const { container } = render(
      <DemoContainer>
        <div>Test Content</div>
      </DemoContainer>
    );
    
    const rootElement = container.firstChild;
    expect(rootElement).toHaveClass('container');
    expect(rootElement).toHaveClass('mx-auto');
    expect(rootElement).toHaveClass('px-4');
    expect(rootElement).toHaveClass('py-8');
  });
});
