
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const PracticeActionButton: React.FC = () => {
  return (
    <Button variant="default" className="astral-button">
      <span>Begin Practice</span>
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default PracticeActionButton;
