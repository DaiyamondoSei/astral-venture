
export const getCategoryGradient = (category: string): string => {
  switch (category) {
    case 'meditation': return 'from-quantum-300 to-quantum-600';
    case 'energy': return 'from-ethereal-300 to-ethereal-600';
    case 'connection': return 'from-ethereal-400 to-ethereal-600';
    case 'astral': return 'from-astral-300 to-astral-600';
    case 'dreams': return 'from-quantum-400 to-quantum-700';
    case 'manifestation': return 'from-astral-300 to-quantum-500';
    case 'intention': return 'from-astral-400 to-astral-600';
    case 'chakras': return 'from-ethereal-300 to-astral-500';
    case 'quantum': return 'from-quantum-300 to-quantum-600';
    case 'healing': return 'from-ethereal-300 to-ethereal-600';
    case 'awareness': return 'from-astral-300 to-astral-600';
    case 'breathwork': return 'from-quantum-400 to-quantum-600';
    case 'guidance': return 'from-quantum-300 to-astral-500';
    default: return 'from-quantum-300 to-quantum-600';
  }
};
