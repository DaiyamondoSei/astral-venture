
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Quote {
  text: string;
  author: string;
  theme: string;
}

interface QuoteDisplayProps {
  quote: Quote;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote }) => {
  return (
    <div className="py-3 px-4 bg-black/30 rounded-lg">
      <p className="italic text-white/80 mb-2">"{quote.text}"</p>
      <p className="text-right text-sm text-white/60">— {quote.author}</p>
    </div>
  );
};

export default QuoteDisplay;
